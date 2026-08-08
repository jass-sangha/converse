<?php

namespace Converse\Chat\Policies;

use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Models\Conversation;
use Illuminate\Database\Eloquent\Model;

class ConversationPolicy
{
    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function view(Model $user, Conversation $conversation): bool
    {
        return $this->participants->isActiveParticipant($conversation->id, $user);
    }

    public function create(Model $user): bool
    {
        return true;
    }

    public function update(Model $user, Conversation $conversation): bool
    {
        if ($conversation->isPrivate()) {
            return false;
        }

        return $this->isAdmin($user, $conversation);
    }

    public function updateAvatar(Model $user, Conversation $conversation): bool
    {
        return $this->update($user, $conversation);
    }

    public function manageParticipants(Model $user, Conversation $conversation): bool
    {
        return $this->isAdmin($user, $conversation);
    }

    protected function isAdmin(Model $user, Conversation $conversation): bool
    {
        $participant = $this->participants->findFor($conversation->id, $user);

        return $participant !== null && $participant->left_at === null && $participant->isAdmin();
    }
}
