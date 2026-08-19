<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Contracts\PinnedMessageServiceInterface;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Models\PinnedMessage;

class PinnedMessageService implements PinnedMessageServiceInterface
{
    public const MAX_PINNED_PER_CONVERSATION = 3;

    public function pin(Message $message, Model $chatable): void
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
            'pinner_type' => $chatable->getMorphClass(),
            'pinner_id' => $chatable->getKey(),
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
