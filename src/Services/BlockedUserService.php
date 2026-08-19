<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\BlockedUserServiceInterface;
use Riwaaq\Chat\Models\BlockedUser;

class BlockedUserService implements BlockedUserServiceInterface
{
    public function block(Model $blocker, Model $blocked): void
    {
        abort_if(Chat::identify($blocker) === Chat::identify($blocked), 422, 'You cannot block yourself.');

        BlockedUser::query()->firstOrCreate([
            'blocker_type' => $blocker->getMorphClass(),
            'blocker_id' => $blocker->getKey(),
            'blocked_type' => $blocked->getMorphClass(),
            'blocked_id' => $blocked->getKey(),
        ]);
    }

    public function unblock(Model $blocker, Model $blocked): void
    {
        BlockedUser::query()
            ->where('blocker_type', $blocker->getMorphClass())
            ->where('blocker_id', $blocker->getKey())
            ->where('blocked_type', $blocked->getMorphClass())
            ->where('blocked_id', $blocked->getKey())
            ->delete();
    }

    public function isBlockedEitherWay(Model $a, Model $b): bool
    {
        return BlockedUser::query()
            ->where(fn ($q) => $q
                ->where('blocker_type', $a->getMorphClass())->where('blocker_id', $a->getKey())
                ->where('blocked_type', $b->getMorphClass())->where('blocked_id', $b->getKey()))
            ->orWhere(fn ($q) => $q
                ->where('blocker_type', $b->getMorphClass())->where('blocker_id', $b->getKey())
                ->where('blocked_type', $a->getMorphClass())->where('blocked_id', $a->getKey()))
            ->exists();
    }

    public function listForUser(Model $blocker, int $perPage): LengthAwarePaginator
    {
        return BlockedUser::query()
            ->where('blocker_type', $blocker->getMorphClass())
            ->where('blocker_id', $blocker->getKey())
            ->latest('id')
            ->paginate($perPage);
    }
}
