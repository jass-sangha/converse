<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\MessageReactionServiceInterface;
use Converse\Chat\Events\MessageReacted;
use Converse\Chat\Models\Message;
use Converse\Chat\Models\MessageReaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class MessageReactionService implements MessageReactionServiceInterface
{
    public function toggle(Message $message, Model $chatable, ?string $emoji): Collection
    {
        $existing = MessageReaction::query()
            ->where('message_id', $message->id)
            ->where('chatable_type', $chatable->getMorphClass())
            ->where('chatable_id', $chatable->getKey())
            ->first();

        if ($emoji === null || $existing?->emoji === $emoji) {
            $existing?->delete();
        } else {
            MessageReaction::query()->updateOrCreate(
                ['message_id' => $message->id, 'chatable_type' => $chatable->getMorphClass(), 'chatable_id' => $chatable->getKey()],
                ['emoji' => $emoji],
            );
        }

        $reactions = $this->grouped($message);

        broadcast(new MessageReacted($message->id, $message->conversation_id, $reactions))->toOthers();

        return $reactions;
    }

    // No `self` field here on purpose — this same collection is both the HTTP response to the
    // actor *and* the broadcast payload shared by every other participant, and "self" can't be
    // scoped per-recipient in a single shared payload. `chatables` carries the objective voter
    // list instead, and the frontend derives "self" from it locally — the same pattern already
    // used for poll/event tallies, for the identical reason (see PollMessage.vue).
    protected function grouped(Message $message): Collection
    {
        return $message->reactions()->get()
            ->groupBy('emoji')
            ->map(fn ($group, $emoji) => [
                'emoji' => $emoji,
                'count' => $group->count(),
                'chatables' => $group->map(fn (MessageReaction $reaction) => [
                    'type' => $reaction->chatable_type,
                    'id' => $reaction->chatable_id,
                ])->values(),
            ])
            ->values();
    }
}
