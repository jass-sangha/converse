<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;
use Illuminate\Support\Collection;

interface ConversationRepositoryInterface
{
    public function getForUser(int $userId, array $filters = []): Collection;

    public function findById(int $id): Conversation;

    public function findPrivateBetween(int $userIdA, int $userIdB): ?Conversation;

    public function create(array $data, array $participantUserIds, int $creatorId): Conversation;

    public function update(Conversation $conversation, array $data): Conversation;
}
