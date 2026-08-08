<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;

interface ParticipantServiceInterface
{
    /**
     * @param  int[]  $userIds
     */
    public function addParticipants(Conversation $conversation, array $userIds, int $actingUserId): void;

    public function removeParticipant(Conversation $conversation, int $targetUserId, int $actingUserId): void;

    public function changeRole(Conversation $conversation, int $targetUserId, string $role): void;

    public function leaveGroup(Conversation $conversation, int $userId): void;
}
