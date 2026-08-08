<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Illuminate\Pagination\LengthAwarePaginator;

interface MessageServiceInterface
{
    public function send(Conversation $conversation, int $userId, array $data): Message;

    public function listForConversation(
        Conversation $conversation,
        int $userId,
        int $perPage,
        ?int $beforeId = null
    ): LengthAwarePaginator;

    public function find(int $id): Message;

    public function update(Message $message, string $body): Message;

    public function deleteForEveryone(Message $message): void;

    public function deleteForMe(Message $message, int $userId): void;

    /**
     * @param  int[]  $conversationIds
     * @return Message[]
     */
    public function forward(Message $message, array $conversationIds, int $userId): array;

    public function search(int $userId, string $query, ?int $conversationId, int $perPage): LengthAwarePaginator;
}
