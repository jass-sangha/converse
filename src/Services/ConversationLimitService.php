<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\ConversationLimitServiceInterface;
use Converse\Chat\Contracts\LicenseServiceInterface;
use Converse\Chat\Models\Conversation;

class ConversationLimitService implements ConversationLimitServiceInterface
{
    public function __construct(
        protected LicenseServiceInterface $license,
    ) {}

    public function maxGroupParticipants(): ?int
    {
        return $this->license->maxGroupParticipants();
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
