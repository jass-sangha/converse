<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;

interface PresenceServiceInterface
{
    public function heartbeat(Model $chatable): void;

    public function status(Model $chatable, ?Model $viewer = null): array;

    /**
     * Mark stale online chatables offline and broadcast the change. Returns the count swept.
     */
    public function sweepStale(): int;
}
