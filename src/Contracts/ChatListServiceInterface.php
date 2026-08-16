<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\ChatList;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface ChatListServiceInterface
{
    /**
     * @param  int[]  $conversationIds
     */
    public function create(Model $chatable, string $name, array $conversationIds): ChatList;

    /**
     * @return Collection<int, ChatList>
     */
    public function listForUser(Model $chatable): Collection;

    public function delete(ChatList $list, Model $chatable): void;

    public function addConversation(ChatList $list, Model $chatable, int $conversationId): void;

    public function removeConversation(ChatList $list, Model $chatable, int $conversationId): void;
}
