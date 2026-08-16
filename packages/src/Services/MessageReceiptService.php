<?php

namespace Converse\Chat\Services;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\MessageReceiptServiceInterface;
use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Events\MessagesDelivered;
use Converse\Chat\Events\MessagesRead;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Converse\Chat\Models\MessageReceipt;
use Illuminate\Database\Eloquent\Model;

class MessageReceiptService implements MessageReceiptServiceInterface
{
    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function markDelivered(Conversation $conversation, Model $chatable): void
    {
        $updated = Chat::whereChatable(MessageReceipt::query(), $chatable)
            ->whereNull('delivered_at')
            ->whereHas('message', fn ($q) => $q->where('conversation_id', $conversation->id))
            ->update(['delivered_at' => now()]);

        if ($updated > 0) {
            broadcast(new MessagesDelivered($conversation->id, $chatable))->toOthers();
        }
    }

    public function markRead(Conversation $conversation, Model $chatable, ?int $upToMessageId = null): void
    {
        $participant = $this->participants->findFor($conversation->id, $chatable);

        abort_if($participant === null, 403);

        $latestId = $upToMessageId ?? Message::query()
            ->where('conversation_id', $conversation->id)
            ->max('id');

        if ($latestId === null) {
            return;
        }

        $alreadyRead = $participant->last_read_message_id !== null
            && $latestId <= $participant->last_read_message_id;

        // A manual "mark as unread" only ever needs clearing here, not advancing further — the
        // cursor itself may already cover everything (nothing new arrived since it was marked),
        // which is exactly the $alreadyRead case below that would otherwise return before ever
        // touching the participant row again.
        if ($participant->manually_unread_at) {
            $participant->update(['manually_unread_at' => null]);
        }

        if ($alreadyRead) {
            return;
        }

        $now = now();

        Chat::whereChatable(MessageReceipt::query(), $chatable)
            ->whereNull('delivered_at')
            ->whereHas('message', fn ($q) => $q->where('conversation_id', $conversation->id)->where('id', '<=', $latestId))
            ->update(['delivered_at' => $now]);

        Chat::whereChatable(MessageReceipt::query(), $chatable)
            ->whereNull('read_at')
            ->whereHas('message', fn ($q) => $q->where('conversation_id', $conversation->id)->where('id', '<=', $latestId))
            ->update(['read_at' => $now]);

        $participant->update([
            'last_read_message_id' => max($latestId, $participant->last_read_message_id ?? 0),
        ]);

        broadcast(new MessagesRead($conversation->id, $chatable, $latestId))->toOthers();
    }
}
