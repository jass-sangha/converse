<?php

namespace Converse\Chat\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;

interface BlockedUserServiceInterface
{
    public function block(int $blockerId, int $blockedId): void;

    public function unblock(int $blockerId, int $blockedId): void;

    public function isBlockedEitherWay(int $userIdA, int $userIdB): bool;

    public function listForUser(int $blockerId, int $perPage): LengthAwarePaginator;
}
