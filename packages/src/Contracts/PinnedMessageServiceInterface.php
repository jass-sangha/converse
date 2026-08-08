<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Illuminate\Support\Collection;

interface PinnedMessageServiceInterface
{
    public function pin(Message $message, int $userId): void;

    public function unpin(Message $message): void;

    public function listForConversation(Conversation $conversation): Collection;
}
