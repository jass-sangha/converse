<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;

interface PinnedMessageServiceInterface
{
    public function pin(Message $message, Model $chatable): void;

    public function unpin(Message $message): void;

    public function listForConversation(Conversation $conversation): Collection;
}
