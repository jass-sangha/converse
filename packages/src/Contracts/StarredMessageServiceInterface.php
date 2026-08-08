<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Message;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface StarredMessageServiceInterface
{
    public function star(Message $message, Model $chatable): void;

    public function unstar(Message $message, Model $chatable): void;

    public function listForUser(Model $chatable, int $perPage): LengthAwarePaginator;
}
