<?php

namespace Riwaaq\Chat\Http\Resources;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Models\ConversationParticipant;
use Riwaaq\Chat\Models\Message;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $me = $viewer ? $this->participants->first(
            fn (ConversationParticipant $p) => $p->chatable_type === $viewer->getMorphClass() && $p->chatable_id === $viewer->getKey()
        ) : null;

        return [
            'id' => $this->id,
            'type' => $this->type?->value,
            'name' => $this->name,
            'description' => $this->description,
            'avatar_url' => $this->avatar_path ? Storage::disk(config('chat.media.disk'))->url($this->avatar_path) : null,
            'disappearing_messages_ttl' => $this->disappearing_messages_ttl,
            'last_activity_at' => $this->last_activity_at,
            'last_message' => $this->relationLoaded('lastMessage')
                ? ($this->lastMessage ? new MessageResource($this->lastMessage) : null)
                : $this->resolveLastMessage($viewer),
            'participants' => ParticipantResource::collection($this->whenLoaded('participants')),
            'unread_count' => $this->getAttribute('unread_count') ?? ($me ? $this->unreadCountFor($me) : 0),
            'me' => $me ? [
                'role' => $me->role?->value,
                'muted_until' => $me->muted_until,
                'archived_at' => $me->archived_at,
                'pinned_at' => $me->pinned_at,
                'favourited_at' => $me->favourited_at,
                'hidden_at' => $me->hidden_at,
                'wallpaper' => $me->wallpaper,
            ] : null,
            'created_at' => $this->created_at,
        ];
    }

    /**
     * The eager-loaded `lastMessage` relation is global — it ignores per-viewer
     * "delete for me" / "clear chat" state, so a viewer who cleared their chat would
     * still see the old preview. Resolve it fresh per viewer instead, excluding
     * whatever they've deleted, so a cleared chat shows an empty preview for them
     * while the other participant's own view is unaffected.
     */
    protected function resolveLastMessage(?Model $viewer): ?MessageResource
    {
        $query = Message::query()->where('conversation_id', $this->id)->orderByDesc('id');

        if ($viewer) {
            $query->whereDoesntHave('deletions', fn ($q) => Chat::whereChatable($q, $viewer));
        }

        $message = $query->with('receipts.chatable')->first();

        return $message ? new MessageResource($message) : null;
    }

    protected function unreadCountFor(ConversationParticipant $participant): int
    {
        $query = Message::query()->where('conversation_id', $this->id);

        if ($participant->last_read_message_id) {
            $query->where('id', '>', $participant->last_read_message_id);
        }

        $count = $query
            ->where(fn ($q) => $q
                ->where('chatable_type', '!=', $participant->chatable_type)
                ->orWhere('chatable_id', '!=', $participant->chatable_id))
            ->count();

        // A manual "mark as unread" doesn't move last_read_message_id (that field also drives
        // read receipts shown to the sender, which this must never touch) — it just floors the
        // count at 1 so the conversation still shows as unread even when the real cursor-based
        // count would otherwise be 0.
        if ($participant->manually_unread_at && $count === 0) {
            return 1;
        }

        return $count;
    }
}
