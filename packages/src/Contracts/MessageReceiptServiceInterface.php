<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;

interface MessageReceiptServiceInterface
{
    public function markDelivered(Conversation $conversation, int $userId): void;

    /**
     * Forward-only: never regresses last_read_message_id or read_at once advanced.
     */
    public function markRead(Conversation $conversation, int $userId, ?int $upToMessageId = null): void;
}
