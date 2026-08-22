<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\ChatListServiceInterface;
use Riwaaq\Chat\Contracts\ParticipantRepositoryInterface;
use Riwaaq\Chat\Models\ChatList;

class ChatListService implements ChatListServiceInterface
{
    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function create(Model $chatable, string $name, array $conversationIds): ChatList
    {
        return DB::transaction(function () use ($chatable, $name, $conversationIds) {
            foreach ($conversationIds as $conversationId) {
                $this->guardParticipant($conversationId, $chatable);
            }

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
        $this->guardParticipant($conversationId, $chatable);

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

    // Without this, syncing an arbitrary conversation_id onto a list the caller does own would
    // let any authenticated user probe whether that id exists (200 vs. a later 404/403 on
    // actually reading it) — every other conversation-scoped endpoint already 403s/404s before
    // returning anything, so this would be the one ID-enumeration oracle in the API.
    protected function guardParticipant(int $conversationId, Model $chatable): void
    {
        abort_unless($this->participants->isActiveParticipant($conversationId, $chatable), 403);
    }
}
