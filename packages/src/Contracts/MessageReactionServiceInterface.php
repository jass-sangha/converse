<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Message;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface MessageReactionServiceInterface
{
    public function toggle(Message $message, Model $chatable, ?string $emoji): Collection;
}
