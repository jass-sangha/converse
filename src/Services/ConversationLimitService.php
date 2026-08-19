<?php

namespace Riwaaq\Chat\Services;

use Riwaaq\Chat\Contracts\ConversationLimitServiceInterface;
use Riwaaq\Chat\Contracts\RiwaaqLimitsInterface;
use Riwaaq\Chat\Models\Conversation;

class ConversationLimitService implements ConversationLimitServiceInterface
{
    public function __construct(
        protected RiwaaqLimitsInterface $limits,
    ) {}

    public function maxGroupParticipants(): ?int
    {
        return $this->limits->maxGroupParticipants();
    }

    public function canAddParticipant(Conversation $conversation): bool
    {
        return $this->canAddParticipants($conversation, 1);
    }

    public function canAddParticipants(Conversation $conversation, int $additionalCount): bool
    {
        $max = $this->maxGroupParticipants();

        if ($max === null) {
            return true;
        }

        return $conversation->activeParticipants()->count() + $additionalCount <= $max;
    }

    public function canCreateGroupWith(int $participantCount): bool
    {
        $max = $this->maxGroupParticipants();

        return $max === null || $participantCount <= $max;
    }
}
