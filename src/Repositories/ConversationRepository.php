<?php

namespace Riwaaq\Chat\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\ConversationRepositoryInterface;
use Riwaaq\Chat\Contracts\ParticipantRepositoryInterface;
use Riwaaq\Chat\Enums\ConversationType;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\ConversationParticipant;
use Riwaaq\Chat\Models\Message;

class ConversationRepository implements ConversationRepositoryInterface
{
    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function getForUser(Model $chatable, array $filters = [], int $perPage = 30): Paginator
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
            // FULLTEXT on MySQL/Postgres (see the migration that adds it) instead of a
            // leading-wildcard LIKE scan, which can't use any index — same tradeoff as
            // MessageRepository::matchBody(). SQLite (tests/tiny installs) keeps the LIKE
            // fallback since it has no FULLTEXT support.
            $useFullText = in_array(DB::connection()->getDriverName(), ['mysql', 'pgsql'], true);

            $query->where(function ($outer) use ($conversationTable, $term, $matches, $useFullText) {
                if ($useFullText) {
                    $outer->whereFullText("{$conversationTable}.name", $term);
                } else {
                    $outer->where("{$conversationTable}.name", 'like', '%'.$term.'%');
                }

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
            ->simplePaginate($perPage);
    }

    public function lastMessagesFor(array $conversationIds, Model $viewer): array
    {
        if ($conversationIds === []) {
            return [];
        }

        // Two queries total regardless of how many conversations: one to find each
        // conversation's latest non-viewer-deleted message id, one to fetch those specific
        // rows (with their eager loads) by id — versus the one-query-per-conversation this
        // replaces in ConversationResource::resolveLastMessage().
        $lastIds = Message::query()
            ->whereIn('conversation_id', $conversationIds)
            ->whereDoesntHave('deletions', fn ($q) => Chat::whereChatable($q, $viewer))
            ->selectRaw('conversation_id, MAX(id) as id')
            ->groupBy('conversation_id')
            ->pluck('id');

        if ($lastIds->isEmpty()) {
            return [];
        }

        return Message::query()
            ->whereIn('id', $lastIds)
            ->with('receipts.chatable')
            ->get()
            ->keyBy('conversation_id')
            ->all();
    }

    public function unreadCountsFor(array $myParticipantByConversationId, Model $viewer): array
    {
        if ($myParticipantByConversationId === []) {
            return [];
        }

        // The unread cutoff (last_read_message_id) is per conversation, not a single shared
        // value, so it can't be a plain WHERE — the CASE picks the right cutoff per row inside
        // one grouped query instead of running a separate COUNT per conversation. Every branch
        // resolves to a boolean (id > ? / FALSE), which stays portable across MySQL/Postgres/
        // SQLite in a WHERE position.
        $cases = [];
        $bindings = [];

        foreach ($myParticipantByConversationId as $conversationId => $participant) {
            $cases[] = 'WHEN conversation_id = ? THEN id > ?';
            $bindings[] = $conversationId;
            $bindings[] = $participant->last_read_message_id ?? 0;
        }

        $counts = Message::query()
            ->whereIn('conversation_id', array_keys($myParticipantByConversationId))
            ->where(fn ($q) => $q
                ->where('chatable_type', '!=', $viewer->getMorphClass())
                ->orWhere('chatable_id', '!=', $viewer->getKey()))
            ->whereRaw('CASE '.implode(' ', $cases).' ELSE FALSE END', $bindings)
            ->selectRaw('conversation_id, COUNT(*) as aggregate')
            ->groupBy('conversation_id')
            ->pluck('aggregate', 'conversation_id')
            ->map(fn ($count) => (int) $count);

        $result = [];

        foreach ($myParticipantByConversationId as $conversationId => $participant) {
            $count = $counts[$conversationId] ?? 0;

            // A manual "mark as unread" doesn't move last_read_message_id (see
            // ConversationResource's original comment) — it just floors the count at 1 so the
            // conversation still shows as unread even when the real cursor-based count is 0.
            $result[$conversationId] = ($participant->manually_unread_at && $count === 0) ? 1 : $count;
        }

        return $result;
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
                'private_pair_key' => $type === ConversationType::Private ? $this->privatePairKey($participants) : null,
                'name' => $type === ConversationType::Group ? ($data['name'] ?? null) : null,
                'creator_type' => $creator->getMorphClass(),
                'creator_id' => $creator->getKey(),
                'last_activity_at' => now(),
            ]);

            $this->participants->addMany($conversation->id, $participants, $creator);

            return $conversation->load(['participants' => fn ($query) => $query->whereNull('left_at')]);
        });
    }

    /**
     * Deterministic regardless of argument order, so both directions of a 1:1 request collide
     * on the same unique index value (see the private_pair_key migration).
     */
    protected function privatePairKey(Collection $participants): string
    {
        return $participants
            ->map(fn (Model $chatable) => Chat::identify($chatable))
            ->sort()
            ->implode('||');
    }

    public function update(Conversation $conversation, array $data): Conversation
    {
        $conversation->fill($data)->save();

        return $conversation->fresh(['participants' => fn ($query) => $query->whereNull('left_at')]);
    }
}
