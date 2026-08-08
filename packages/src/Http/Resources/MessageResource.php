<?php

namespace Converse\Chat\Http\Resources;

use Converse\Chat\Contracts\UserSettingsServiceInterface;
use Converse\Chat\Models\MessageReaction;
use Converse\Chat\Models\MessageReceipt;
use Converse\Chat\Models\StarredMessage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewer = $request->user();

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'chatable_type' => $this->chatable_type,
            'chatable_id' => $this->chatable_id,
            'type' => $this->type?->value,
            'body' => $this->isDeletedForEveryone() ? null : $this->body,
            'is_forwarded' => $this->is_forwarded,
            'metadata' => $this->isDeletedForEveryone() ? null : $this->metadata,
            'edited_at' => $this->edited_at,
            'deleted_for_everyone' => $this->isDeletedForEveryone(),
            'reply_to' => $this->whenLoaded('replyTo', fn () => $this->replyTo ? [
                'id' => $this->replyTo->id,
                'chatable_type' => $this->replyTo->chatable_type,
                'chatable_id' => $this->replyTo->chatable_id,
                'body' => str($this->replyTo->body ?? '')->limit(100)->toString(),
            ] : null),
            'attachments' => $this->whenLoaded('attachments', fn () => $this->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'url' => $attachment->url,
                'thumbnail_url' => $attachment->thumbnail_url,
                'mime_type' => $attachment->mime_type,
                'original_filename' => $attachment->original_filename,
                'size_bytes' => $attachment->size_bytes,
                'width' => $attachment->width,
                'height' => $attachment->height,
                'duration_seconds' => $attachment->duration_seconds,
            ])),
            'reactions' => $this->whenLoaded('reactions', fn () => $this->reactions
                ->groupBy('emoji')
                ->map(fn ($group, $emoji) => [
                    'emoji' => $emoji,
                    'count' => $group->count(),
                    'self' => $viewer !== null && $group->contains(fn (MessageReaction $r) => $this->isChatable($r, $viewer)),
                    'chatables' => $group->map(fn (MessageReaction $r) => ['type' => $r->chatable_type, 'id' => $r->chatable_id])->values(),
                ])
                ->values()),
            'status' => $this->whenLoaded('receipts', fn () => $this->receiptStatus($viewer)),
            'is_starred_by_me' => $this->whenLoaded('starredBy', fn () => $viewer !== null
                && $this->starredBy->contains(fn (StarredMessage $s) => $this->isChatable($s, $viewer))),
            'is_pinned' => $this->whenLoaded('pinnedIn', fn () => $this->pinnedIn !== null, false),
            'conversation' => $this->whenLoaded('conversation', fn () => [
                'id' => $this->conversation->id,
                'name' => $this->conversation->name,
                'type' => $this->conversation->type?->value,
                'participants' => $this->conversation->relationLoaded('participants')
                    ? $this->conversation->participants->map(fn ($p) => ['type' => $p->chatable_type, 'id' => $p->chatable_id])->values()
                    : [],
            ]),
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
        ];
    }

    protected function isChatable(mixed $row, Model $chatable): bool
    {
        return $row->chatable_type === $chatable->getMorphClass() && $row->chatable_id === $chatable->getKey();
    }

    protected function receiptStatus(?Model $viewer): string
    {
        $receipts = $this->receipts;

        if ($receipts->isEmpty()) {
            return 'sent';
        }

        $settings = app(UserSettingsServiceInterface::class);

        // Reciprocity: if the viewer has turned off their own read-receipt sharing,
        // WhatsApp caps everything they see at "delivered" regardless of actual reads.
        $viewerAllowsReadReceipts = $viewer === null || $settings->allowsReadReceipts($viewer);

        $countsAsRead = fn (MessageReceipt $receipt) => $receipt->read_at !== null
            && $receipt->chatable !== null
            && $settings->allowsReadReceipts($receipt->chatable);

        if ($viewerAllowsReadReceipts && $receipts->every($countsAsRead)) {
            return 'read';
        }

        if ($receipts->every(fn (MessageReceipt $receipt) => $receipt->delivered_at !== null)) {
            return 'delivered';
        }

        return 'sent';
    }
}
