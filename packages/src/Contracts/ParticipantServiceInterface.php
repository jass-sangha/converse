<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface ParticipantServiceInterface
{
    /**
     * @param  Collection<int, Model>  $chatables
     */
    public function addParticipants(Conversation $conversation, Collection $chatables, Model $actor): Message;

    public function removeParticipant(Conversation $conversation, Model $target, Model $actor): void;

    public function changeRole(Conversation $conversation, Model $target, string $role): void;

    public function leaveGroup(Conversation $conversation, Model $chatable): void;
}
