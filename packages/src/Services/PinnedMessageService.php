<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\PinnedMessageServiceInterface;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Converse\Chat\Models\PinnedMessage;
use Illuminate\Support\Collection;

class PinnedMessageService implements PinnedMessageServiceInterface
{
    public const MAX_PINNED_PER_CONVERSATION = 3;

    public function pin(Message $message, int $userId): void
    {
        $existing = PinnedMessage::query()
            ->where('conversation_id', $message->conversation_id)
            ->where('message_id', $message->id)
            ->exists();

        if ($existing) {
            return;
        }

        $count = PinnedMessage::query()
            ->where('conversation_id', $message->conversation_id)
            ->count();

        abort_if(
            $count >= self::MAX_PINNED_PER_CONVERSATION,
            422,
            'Only '.self::MAX_PINNED_PER_CONVERSATION.' messages can be pinned in a chat.'
        );

        PinnedMessage::query()->create([
            'conversation_id' => $message->conversation_id,
            'message_id' => $message->id,
            'pinned_by' => $userId,
        ]);
    }

    public function unpin(Message $message): void
    {
        PinnedMessage::query()
            ->where('conversation_id', $message->conversation_id)
            ->where('message_id', $message->id)
            ->delete();
    }

    public function listForConversation(Conversation $conversation): Collection
    {
        return PinnedMessage::query()
            ->where('conversation_id', $conversation->id)
            ->with('message.attachments', 'message.reactions')
            ->oldest('id')
            ->get();
    }
}
