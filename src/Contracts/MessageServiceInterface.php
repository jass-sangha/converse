<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;

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

    /**
     * @param  string  $kind  'media' (images/videos/gifs), 'docs', or 'links'
     * @param  string|null  $search  Matches attachment filename, conversation name, or participant name.
     */
    public function media(Model $chatable, string $kind, ?int $conversationId, int $perPage, ?string $search = null): LengthAwarePaginator;
}
