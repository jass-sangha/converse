<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Message;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface EventRsvpServiceInterface
{
    /**
     * Set (or, when $status is null, clear) the chatable's RSVP status for the event.
     */
    public function respond(Message $message, Model $chatable, ?string $status): Collection;
}
