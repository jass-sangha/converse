<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\ConversationParticipant;
use Illuminate\Support\Collection;

interface ParticipantRepositoryInterface
{
    public function addMany(int $conversationId, array $userIds, ?int $adminUserId = null): void;

    public function findForUser(int $conversationId, int $userId): ?ConversationParticipant;

    public function isActiveParticipant(int $conversationId, int $userId): bool;

    public function activeUserIds(int $conversationId): array;

    public function activeForConversation(int $conversationId): Collection;

    public function remove(int $conversationId, int $userId): void;

    public function clearHiddenForOthers(int $conversationId, int $exceptUserId): void;

    public function adminCount(int $conversationId): int;
}
