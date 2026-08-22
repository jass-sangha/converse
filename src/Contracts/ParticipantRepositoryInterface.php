<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Models\ConversationParticipant;

interface ParticipantRepositoryInterface
{
    /**
     * @param  Collection<int, Model>  $chatables
     */
    public function addMany(int $conversationId, Collection $chatables, ?Model $admin = null): void;

    public function findFor(int $conversationId, Model $chatable): ?ConversationParticipant;

    public function isActiveParticipant(int $conversationId, Model $chatable): bool;

    /**
     * Same check as isActiveParticipant(), batched: one query for any number of conversation
     * ids instead of one per id.
     *
     * @param  list<int>  $conversationIds
     * @return list<int> the subset of $conversationIds the chatable is an active participant of
     */
    public function activeParticipantConversationIds(array $conversationIds, Model $chatable): array;

    /**
     * The inverse batch: each active conversation id per chatable, for a whole group of
     * chatables in one query per morph type (typically one query total) instead of one query
     * per chatable.
     *
     * @param  iterable<Model>  $chatables
     * @return array<string, list<int>> keyed by Chat::identify($chatable)
     */
    public function activeConversationIdsForChatables(iterable $chatables): array;

    /**
     * @return Collection<int, Model> The resolved chatable model instances, not repository rows.
     */
    public function activeChatables(int $conversationId): Collection;

    public function activeForConversation(int $conversationId): Collection;

    public function remove(int $conversationId, Model $chatable): void;

    public function clearHiddenForOthers(int $conversationId, Model $except): void;

    public function adminCount(int $conversationId): int;
}
