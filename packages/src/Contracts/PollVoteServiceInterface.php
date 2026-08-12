<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Message;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface PollVoteServiceInterface
{
    /**
     * Toggle the chatable's vote for the given option. If the message's poll is not
     * multiple-choice, any other votes the chatable holds on this message are cleared first.
     */
    public function toggle(Message $message, Model $chatable, int $optionIndex): Collection;
}
