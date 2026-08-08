<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Message;
use Illuminate\Pagination\LengthAwarePaginator;

interface StarredMessageServiceInterface
{
    public function star(Message $message, int $userId): void;

    public function unstar(Message $message, int $userId): void;

    public function listForUser(int $userId, int $perPage): LengthAwarePaginator;
}
