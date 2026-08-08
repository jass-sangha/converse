<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Illuminate\Pagination\LengthAwarePaginator;

interface MessageRepositoryInterface
{
    public function create(array $data): Message;

    public function findById(int $id): Message;

    public function paginateForConversation(
        Conversation $conversation,
        int $userId,
        int $perPage,
        ?int $beforeId = null
    ): LengthAwarePaginator;

    public function search(int $userId, string $query, ?int $conversationId, int $perPage): LengthAwarePaginator;
}
