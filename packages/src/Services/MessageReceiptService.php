<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\MessageReceiptServiceInterface;
use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Events\MessagesDelivered;
use Converse\Chat\Events\MessagesRead;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Converse\Chat\Models\MessageReceipt;

class MessageReceiptService implements MessageReceiptServiceInterface
{
    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function markDelivered(Conversation $conversation, int $userId): void
    {
        $updated = MessageReceipt::query()
            ->where('user_id', $userId)
            ->whereNull('delivered_at')
            ->whereHas('message', fn ($q) => $q->where('conversation_id', $conversation->id))
            ->update(['delivered_at' => now()]);

        if ($updated > 0) {
            broadcast(new MessagesDelivered($conversation->id, $userId))->toOthers();
        }
    }

    public function markRead(Conversation $conversation, int $userId, ?int $upToMessageId = null): void
    {
        $participant = $this->participants->findForUser($conversation->id, $userId);

        abort_if($participant === null, 403);

        $latestId = $upToMessageId ?? Message::query()
            ->where('conversation_id', $conversation->id)
            ->max('id');

        if ($latestId === null) {
            return;
        }

        $alreadyRead = $participant->last_read_message_id !== null
            && $latestId <= $participant->last_read_message_id;

        if ($alreadyRead) {
            return;
        }

        $now = now();

        MessageReceipt::query()
            ->where('user_id', $userId)
            ->whereNull('delivered_at')
            ->whereHas('message', fn ($q) => $q->where('conversation_id', $conversation->id)->where('id', '<=', $latestId))
            ->update(['delivered_at' => $now]);

        MessageReceipt::query()
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->whereHas('message', fn ($q) => $q->where('conversation_id', $conversation->id)->where('id', '<=', $latestId))
            ->update(['read_at' => $now]);

        $participant->update([
            'last_read_message_id' => max($latestId, $participant->last_read_message_id ?? 0),
        ]);

        broadcast(new MessagesRead($conversation->id, $userId, $latestId))->toOthers();
    }
}
