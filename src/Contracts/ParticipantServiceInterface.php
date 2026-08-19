<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;

interface ParticipantServiceInterface
{
    /**
     * @param  Collection<int, Model>  $chatables
     */
    public function addParticipants(Conversation $conversation, Collection $chatables, Model $actor): Message;

    public function removeParticipant(Conversation $conversation, Model $target, Model $actor): Message;

    public function changeRole(Conversation $conversation, Model $target, string $role): Message;

    public function leaveGroup(Conversation $conversation, Model $chatable): void;
}
