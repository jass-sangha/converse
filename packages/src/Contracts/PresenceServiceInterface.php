<?php

namespace Converse\Chat\Contracts;

interface PresenceServiceInterface
{
    public function heartbeat(int $userId): void;

    public function status(int $userId, ?int $viewerUserId = null): array;

    /**
     * Mark stale online users offline and broadcast the change. Returns the count swept.
     */
    public function sweepStale(): int;
}
