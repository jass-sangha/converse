<?php

namespace Converse\Chat\Repositories;

use Converse\Chat\Contracts\MessageRepositoryInterface;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Illuminate\Pagination\LengthAwarePaginator;

class MessageRepository implements MessageRepositoryInterface
{
    public function create(array $data): Message
    {
        return Message::query()->create($data);
    }

    public function findById(int $id): Message
    {
        return Message::query()->findOrFail($id);
    }

    public function paginateForConversation(
        Conversation $conversation,
        int $userId,
        int $perPage,
        ?int $beforeId = null
    ): LengthAwarePaginator {
        $query = Message::query()
            ->where('conversation_id', $conversation->id)
            ->whereDoesntHave('deletions', fn ($q) => $q->where('user_id', $userId))
            ->with(['user', 'attachments', 'reactions', 'replyTo', 'receipts', 'starredBy', 'pinnedIn'])
            ->orderByDesc('id');

        if ($beforeId !== null) {
            $query->where('id', '<', $beforeId);
        }

        return $query->paginate($perPage);
    }

    public function search(int $userId, string $query, ?int $conversationId, int $perPage): LengthAwarePaginator
    {
        $builder = Message::query()
            ->whereHas('conversation.participants', function ($q) use ($userId) {
                $q->where('user_id', $userId)->whereNull('left_at');
            })
            ->whereDoesntHave('deletions', fn ($q) => $q->where('user_id', $userId))
            ->whereNull('deleted_for_everyone_at')
            ->where('body', 'like', '%'.$query.'%')
            ->with(['user', 'attachments', 'reactions', 'replyTo', 'receipts', 'starredBy', 'pinnedIn'])
            ->orderByDesc('id');

        if ($conversationId !== null) {
            $builder->where('conversation_id', $conversationId);
        }

        return $builder->paginate($perPage);
    }
}
