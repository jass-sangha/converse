<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\MessageReactionServiceInterface;
use Converse\Chat\Events\MessageReacted;
use Converse\Chat\Models\Message;
use Converse\Chat\Models\MessageReaction;
use Illuminate\Support\Collection;

class MessageReactionService implements MessageReactionServiceInterface
{
    public function toggle(Message $message, int $userId, ?string $emoji): Collection
    {
        $existing = MessageReaction::query()
            ->where('message_id', $message->id)
            ->where('user_id', $userId)
            ->first();

        if ($emoji === null || $existing?->emoji === $emoji) {
            $existing?->delete();
        } else {
            MessageReaction::query()->updateOrCreate(
                ['message_id' => $message->id, 'user_id' => $userId],
                ['emoji' => $emoji],
            );
        }

        $reactions = $this->grouped($message);

        broadcast(new MessageReacted($message->id, $message->conversation_id, $reactions))->toOthers();

        return $reactions;
    }

    protected function grouped(Message $message): Collection
    {
        return $message->reactions()->get()
            ->groupBy('emoji')
            ->map(fn ($group, $emoji) => [
                'emoji' => $emoji,
                'count' => $group->count(),
                'user_ids' => $group->pluck('user_id')->values(),
            ])
            ->values();
    }
}
