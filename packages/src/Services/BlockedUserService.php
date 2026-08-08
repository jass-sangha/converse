<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\BlockedUserServiceInterface;
use Converse\Chat\Models\BlockedUser;
use Illuminate\Pagination\LengthAwarePaginator;

class BlockedUserService implements BlockedUserServiceInterface
{
    public function block(int $blockerId, int $blockedId): void
    {
        abort_if($blockerId === $blockedId, 422, 'You cannot block yourself.');

        BlockedUser::query()->firstOrCreate([
            'blocker_id' => $blockerId,
            'blocked_id' => $blockedId,
        ]);
    }

    public function unblock(int $blockerId, int $blockedId): void
    {
        BlockedUser::query()
            ->where('blocker_id', $blockerId)
            ->where('blocked_id', $blockedId)
            ->delete();
    }

    public function isBlockedEitherWay(int $userIdA, int $userIdB): bool
    {
        return BlockedUser::query()
            ->where(fn ($q) => $q->where('blocker_id', $userIdA)->where('blocked_id', $userIdB))
            ->orWhere(fn ($q) => $q->where('blocker_id', $userIdB)->where('blocked_id', $userIdA))
            ->exists();
    }

    public function listForUser(int $blockerId, int $perPage): LengthAwarePaginator
    {
        return BlockedUser::query()
            ->where('blocker_id', $blockerId)
            ->latest('id')
            ->paginate($perPage);
    }
}
