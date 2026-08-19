<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Models\Conversation;

interface ConversationRepositoryInterface
{
    public function getForUser(Model $chatable, array $filters = []): Collection;

    public function findById(int $id): Conversation;

    public function findPrivateBetween(Model $a, Model $b): ?Conversation;

    /**
     * @param  Collection<int, Model>  $participants
     */
    public function create(array $data, Collection $participants, Model $creator): Conversation;

    public function update(Conversation $conversation, array $data): Conversation;
}
