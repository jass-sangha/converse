<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Riwaaq\Chat\Models\Message;

interface StarredMessageServiceInterface
{
    public function star(Message $message, Model $chatable): void;

    public function unstar(Message $message, Model $chatable): void;

    public function listForUser(Model $chatable, int $perPage, ?int $conversationId = null): LengthAwarePaginator;
}
