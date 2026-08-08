<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Message;
use Illuminate\Support\Collection;

interface MessageReactionServiceInterface
{
    public function toggle(Message $message, int $userId, ?string $emoji): Collection;
}
