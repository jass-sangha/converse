<?php

namespace Converse\Chat\Repositories;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\ConversationRepositoryInterface;
use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Enums\ConversationType;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\ConversationParticipant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ConversationRepository implements ConversationRepositoryInterface
{
    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function getForUser(Model $chatable, array $filters = []): Collection
    {
        $participantTable = (new ConversationParticipant)->getTable();
        $conversationTable = (new Conversation)->getTable();

        $query = Conversation::query()
            ->whereHas('participants', function ($query) use ($chatable) {
                Chat::whereChatable($query, $chatable)->whereNull('left_at');
            })
            ->with(['participants' => fn ($query) => $query->whereNull('left_at')])
            ->leftJoin("{$participantTable} as my_participation", function ($join) use ($chatable, $conversationTable) {
                $join->on('my_participation.conversation_id', '=', "{$conversationTable}.id")
                    ->where('my_participation.chatable_type', '=', $chatable->getMorphClass())
                    ->where('my_participation.chatable_id', '=', $chatable->getKey());
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
            $term = $filters['q'];
            $matches = Chat::matchingChatablePairs($term);

            $query->where(function ($outer) use ($conversationTable, $term, $matches) {
                $outer->where("{$conversationTable}.name", 'like', '%'.$term.'%');

                // Private conversations have no stored `name` — their display name is the
                // other participant's, resolved client-side — so matching only the column
                // above never finds a private chat by contact name. Also match conversations
                // where a participant's own chatable record has a matching name.
                if (! empty($matches)) {
                    $outer->orWhereHas('participants', function ($participantQuery) use ($matches) {
                        $participantQuery->where(function ($inner) use ($matches) {
                            foreach ($matches as [$type, $id]) {
                                $inner->orWhere(fn ($q) => $q->where('chatable_type', $type)->where('chatable_id', $id));
                            }
                        });
                    });
                }
            });
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

    public function findPrivateBetween(Model $a, Model $b): ?Conversation
    {
        return Conversation::query()
            ->where('type', ConversationType::Private->value)
            ->whereHas('participants', fn ($q) => Chat::whereChatable($q, $a)->whereNull('left_at'))
            ->whereHas('participants', fn ($q) => Chat::whereChatable($q, $b)->whereNull('left_at'))
            ->whereDoesntHave('participants', function ($query) use ($a, $b) {
                $query->whereNull('left_at')
                    ->where(function ($query) use ($a, $b) {
                        $query
                            ->where(fn ($q) => $q->where('chatable_type', '!=', $a->getMorphClass())->orWhere('chatable_id', '!=', $a->getKey()))
                            ->where(fn ($q) => $q->where('chatable_type', '!=', $b->getMorphClass())->orWhere('chatable_id', '!=', $b->getKey()));
                    });
            })
            ->first();
    }

    public function create(array $data, Collection $participants, Model $creator): Conversation
    {
        return DB::transaction(function () use ($data, $participants, $creator) {
            $type = $participants->count() > 2 ? ConversationType::Group : ConversationType::Private;

            $conversation = Conversation::query()->create([
                ...$data,
                'type' => $type,
                'name' => $type === ConversationType::Group ? ($data['name'] ?? null) : null,
                'creator_type' => $creator->getMorphClass(),
                'creator_id' => $creator->getKey(),
                'last_activity_at' => now(),
            ]);

            $this->participants->addMany($conversation->id, $participants, $creator);

            return $conversation->load('participants');
        });
    }

    public function update(Conversation $conversation, array $data): Conversation
    {
        $conversation->fill($data)->save();

        return $conversation->fresh('participants');
    }
}
