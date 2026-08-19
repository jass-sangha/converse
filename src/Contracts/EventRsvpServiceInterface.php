<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Models\Message;

interface EventRsvpServiceInterface
{
    /**
     * Set (or, when $status is null, clear) the chatable's RSVP status for the event.
     */
    public function respond(Message $message, Model $chatable, ?string $status): Collection;
}
