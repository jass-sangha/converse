<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\ConversationParticipant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface ParticipantRepositoryInterface
{
    /**
     * @param  Collection<int, Model>  $chatables
     */
    public function addMany(int $conversationId, Collection $chatables, ?Model $admin = null): void;

    public function findFor(int $conversationId, Model $chatable): ?ConversationParticipant;

    public function isActiveParticipant(int $conversationId, Model $chatable): bool;

    /**
     * @return Collection<int, Model> The resolved chatable model instances, not repository rows.
     */
    public function activeChatables(int $conversationId): Collection;

    public function activeForConversation(int $conversationId): Collection;

    public function remove(int $conversationId, Model $chatable): void;

    public function clearHiddenForOthers(int $conversationId, Model $except): void;

    public function adminCount(int $conversationId): int;
}
