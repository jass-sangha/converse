<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;

interface MessageRepositoryInterface
{
    public function create(array $data): Message;

    public function findById(int $id): Message;

    public function paginateForConversation(
        Conversation $conversation,
        Model $chatable,
        int $perPage,
        ?int $beforeId = null
    ): Paginator;

    public function search(Model $chatable, string $query, ?int $conversationId, int $perPage): Paginator;

    public function clearForChatable(Conversation $conversation, Model $chatable): void;

    /**
     * @param  string  $kind  'media' (images/videos/gifs), 'docs', or 'links'
     * @param  string|null  $search  Matches attachment filename, conversation name, or participant name.
     */
    public function media(Model $chatable, string $kind, ?int $conversationId, int $perPage, ?string $search = null): LengthAwarePaginator;

    /**
     * Per-message recipient/delivered/read counts, batched for a whole page of messages at
     * once — see MessageRepository's implementation for why this replaces loading full receipt
     * rows (with their chatable models) just to derive a sent/delivered/read status.
     *
     * @param  list<int>  $messageIds
     * @return array<int, array{recipient_count: int, delivered_count: int, read_count: int}>
     */
    public function receiptSummariesFor(array $messageIds): array;
}
