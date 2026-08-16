<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;
use Illuminate\Database\Eloquent\Model;

interface MessageReceiptServiceInterface
{
    public function markDelivered(Conversation $conversation, Model $chatable): void;

    /**
     * Forward-only: never regresses last_read_message_id or read_at once advanced.
     */
    public function markRead(Conversation $conversation, Model $chatable, ?int $upToMessageId = null): void;
}
