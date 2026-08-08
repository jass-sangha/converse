<?php

namespace Converse\Chat\Repositories;

use Converse\Chat\Contracts\ConversationRepositoryInterface;
use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Enums\ConversationType;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\ConversationParticipant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ConversationRepository implements ConversationRepositoryInterface
{
    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function getForUser(int $userId, array $filters = []): Collection
    {
        $participantTable = (new ConversationParticipant)->getTable();
        $conversationTable = (new Conversation)->getTable();

        $query = Conversation::query()
            ->whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId)->whereNull('left_at');
            })
            ->with(['participants' => fn ($query) => $query->whereNull('left_at'), 'lastMessage'])
            ->leftJoin("{$participantTable} as my_participation", function ($join) use ($userId, $conversationTable) {
                $join->on('my_participation.conversation_id', '=', "{$conversationTable}.id")
                    ->where('my_participation.user_id', '=', $userId);
            })
            ->select("{$conversationTable}.*");

        if (array_key_exists('archived', $filters)) {
            $filters['archived']
                ? $query->whereNotNull('my_participation.archived_at')
                : $query->whereNull('my_participation.archived_at');
        }

        if (array_key_exists('pinned', $filters) && $filters['pinned']) {
            $query->whereNotNull('my_participation.pinned_at');
        }

        if (array_key_exists('hidden', $filters)) {
            $filters['hidden']
                ? $query->whereNotNull('my_participation.hidden_at')
                : $query->whereNull('my_participation.hidden_at');
        } else {
            $query->whereNull('my_participation.hidden_at');
        }

        if (! empty($filters['q'])) {
            $query->where("{$conversationTable}.name", 'like', '%'.$filters['q'].'%');
        }

        return $query
            ->orderByRaw('my_participation.pinned_at IS NULL')
            ->orderByDesc('my_participation.pinned_at')
            ->orderByDesc("{$conversationTable}.last_activity_at")
            ->get();
    }

    public function findById(int $id): Conversation
    {
        return Conversation::query()->findOrFail($id);
    }

    public function findPrivateBetween(int $userIdA, int $userIdB): ?Conversation
    {
        return Conversation::query()
            ->where('type', ConversationType::Private->value)
            ->whereHas('participants', fn ($q) => $q->where('user_id', $userIdA)->whereNull('left_at'))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $userIdB)->whereNull('left_at'))
            ->whereDoesntHave('participants', function ($query) use ($userIdA, $userIdB) {
                $query->whereNull('left_at')->whereNotIn('user_id', [$userIdA, $userIdB]);
            })
            ->first();
    }

    public function create(array $data, array $participantUserIds, int $creatorId): Conversation
    {
        return DB::transaction(function () use ($data, $participantUserIds, $creatorId) {
            $type = count($participantUserIds) > 2 ? ConversationType::Group : ConversationType::Private;

            $conversation = Conversation::query()->create([
                ...$data,
                'type' => $type,
                'name' => $type === ConversationType::Group ? ($data['name'] ?? null) : null,
                'created_by' => $creatorId,
                'last_activity_at' => now(),
            ]);

            $this->participants->addMany($conversation->id, $participantUserIds, $creatorId);

            return $conversation->load('participants');
        });
    }

    public function update(Conversation $conversation, array $data): Conversation
    {
        $conversation->fill($data)->save();

        return $conversation->fresh('participants');
    }
}
