<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface MessageServiceInterface
{
    public function send(Conversation $conversation, Model $chatable, array $data): Message;

    public function listForConversation(
        Conversation $conversation,
        Model $chatable,
        int $perPage,
        ?int $beforeId = null
    ): LengthAwarePaginator;

    public function find(int $id): Message;

    public function update(Message $message, string $body): Message;

    public function deleteForEveryone(Message $message): void;

    public function deleteForMe(Message $message, Model $chatable): void;

    /**
     * @param  int[]  $conversationIds
     * @return Message[]
     */
    public function forward(Message $message, array $conversationIds, Model $chatable): array;

    public function search(Model $chatable, string $query, ?int $conversationId, int $perPage): LengthAwarePaginator;

    public function clearForChatable(Conversation $conversation, Model $chatable): void;
}
