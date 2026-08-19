<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface BlockedUserServiceInterface
{
    public function block(Model $blocker, Model $blocked): void;

    public function unblock(Model $blocker, Model $blocked): void;

    public function isBlockedEitherWay(Model $a, Model $b): bool;

    public function listForUser(Model $blocker, int $perPage): LengthAwarePaginator;
}
