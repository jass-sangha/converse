<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Models\Message;

interface MessageReactionServiceInterface
{
    public function toggle(Message $message, Model $chatable, ?string $emoji): Collection;
}
