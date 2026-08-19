<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\ChatListServiceInterface;
use Riwaaq\Chat\Models\ChatList;

class ChatListService implements ChatListServiceInterface
{
    public function create(Model $chatable, string $name, array $conversationIds): ChatList
    {
        return DB::transaction(function () use ($chatable, $name, $conversationIds) {
            $list = ChatList::query()->create([
                'chatable_type' => $chatable->getMorphClass(),
                'chatable_id' => $chatable->getKey(),
                'name' => $name,
            ]);

            if (! empty($conversationIds)) {
                $list->conversations()->sync($conversationIds);
            }

            return $list;
        });
    }

    public function listForUser(Model $chatable): Collection
    {
        return Chat::whereChatable(ChatList::query(), $chatable)
            ->with('conversations')
            ->latest('id')
            ->get();
    }

    public function delete(ChatList $list, Model $chatable): void
    {
        $this->guardOwnership($list, $chatable);

        $list->delete();
    }

    public function addConversation(ChatList $list, Model $chatable, int $conversationId): void
    {
        $this->guardOwnership($list, $chatable);

        $list->conversations()->syncWithoutDetaching([$conversationId]);
    }

    public function removeConversation(ChatList $list, Model $chatable, int $conversationId): void
    {
        $this->guardOwnership($list, $chatable);

        $list->conversations()->detach($conversationId);
    }

    protected function guardOwnership(ChatList $list, Model $chatable): void
    {
        abort_unless(Chat::identify($list->chatable) === Chat::identify($chatable), 403);
    }
}
