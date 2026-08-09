<?php

namespace Converse\Chat\Repositories;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\MessageRepositoryInterface;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Converse\Chat\Models\MessageDeletion;
use Illuminate\Database\Eloquent\Model;
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
        Model $chatable,
        int $perPage,
        ?int $beforeId = null
    ): LengthAwarePaginator {
        $query = Message::query()
            ->where('conversation_id', $conversation->id)
            ->whereDoesntHave('deletions', fn ($q) => Chat::whereChatable($q, $chatable))
            ->with(['chatable', 'attachments', 'reactions', 'replyTo', 'receipts.chatable', 'starredBy', 'pinnedIn'])
            ->orderByDesc('id');

        if ($beforeId !== null) {
            $query->where('id', '<', $beforeId);
        }

        return $query->paginate($perPage);
    }

    public function search(Model $chatable, string $query, ?int $conversationId, int $perPage): LengthAwarePaginator
    {
        $builder = Message::query()
            ->whereHas('conversation.participants', fn ($q) => Chat::whereChatable($q, $chatable)->whereNull('left_at'))
            ->whereDoesntHave('deletions', fn ($q) => Chat::whereChatable($q, $chatable))
            ->whereNull('deleted_for_everyone_at')
            ->where('body', 'like', '%'.$query.'%')
            ->with(['chatable', 'attachments', 'reactions', 'replyTo', 'receipts.chatable', 'starredBy', 'pinnedIn', 'conversation.participants'])
            ->orderByDesc('id');

        if ($conversationId !== null) {
            $builder->where('conversation_id', $conversationId);
        }

        return $builder->paginate($perPage);
    }

    public function media(Model $chatable, string $kind, ?int $conversationId, int $perPage): LengthAwarePaginator
    {
        $builder = Message::query()
            ->whereHas('conversation.participants', fn ($q) => Chat::whereChatable($q, $chatable)->whereNull('left_at'))
            ->whereDoesntHave('deletions', fn ($q) => Chat::whereChatable($q, $chatable))
            ->whereNull('deleted_for_everyone_at')
            ->with(['chatable', 'attachments', 'conversation'])
            ->orderByDesc('id');

        match ($kind) {
            'media' => $builder->whereIn('type', ['image', 'video', 'gif']),
            'docs' => $builder->where('type', 'document'),
            'links' => $builder->where('type', 'text')->whereNotNull('metadata->link_preview'),
        };

        if ($conversationId !== null) {
            $builder->where('conversation_id', $conversationId);
        }

        return $builder->paginate($perPage);
    }

    public function clearForChatable(Conversation $conversation, Model $chatable): void
    {
        $ids = Message::query()
            ->where('conversation_id', $conversation->id)
            ->whereDoesntHave('deletions', fn ($q) => Chat::whereChatable($q, $chatable))
            ->pluck('id');

        if ($ids->isEmpty()) {
            return;
        }

        $rows = $ids->map(fn (int $id) => [
            'message_id' => $id,
            'chatable_type' => $chatable->getMorphClass(),
            'chatable_id' => $chatable->getKey(),
            'deleted_at' => now(),
        ])->all();

        MessageDeletion::query()->upsert($rows, ['message_id', 'chatable_type', 'chatable_id'], ['deleted_at']);
    }
}
