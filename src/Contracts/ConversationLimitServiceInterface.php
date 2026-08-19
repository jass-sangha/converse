<?php

namespace Riwaaq\Chat\Contracts;

use Riwaaq\Chat\Models\Conversation;

/**
 * Centralizes the "is this conversation allowed to grow" rule so it's checked in exactly
 * one place whether a participant is being added to an existing conversation or a brand
 * new group is being created with several participants at once.
 */
interface ConversationLimitServiceInterface
{
    public function maxGroupParticipants(): ?int;

    public function canAddParticipant(Conversation $conversation): bool;

    public function canAddParticipants(Conversation $conversation, int $additionalCount): bool;

    public function canCreateGroupWith(int $participantCount): bool;
}
