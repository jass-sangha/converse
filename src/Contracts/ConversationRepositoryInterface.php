<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\ConversationParticipant;
use Riwaaq\Chat\Models\Message;

interface ConversationRepositoryInterface
{
    public function getForUser(Model $chatable, array $filters = [], int $perPage = 30): Paginator;

    public function findById(int $id): Conversation;

    public function findPrivateBetween(Model $a, Model $b): ?Conversation;

    /**
     * @param  Collection<int, Model>  $participants
     */
    public function create(array $data, Collection $participants, Model $creator): Conversation;

    public function update(Conversation $conversation, array $data): Conversation;

    /**
     * The last non-viewer-deleted message for each of the given conversations, in one query
     * pair rather than one per conversation — see ConversationResource for why this matters.
     *
     * @param  list<int>  $conversationIds
     * @return array<int, Message> keyed by conversation_id
     */
    public function lastMessagesFor(array $conversationIds, Model $viewer): array;

    /**
     * Unread counts (messages after each conversation's own last_read_message_id, excluding
     * the viewer's own) for every conversation at once, instead of one COUNT query each.
     *
     * @param  array<int, ConversationParticipant>  $myParticipantByConversationId  keyed by conversation_id
     * @return array<int, int> keyed by conversation_id
     */
    public function unreadCountsFor(array $myParticipantByConversationId, Model $viewer): array;
}
