<?php

namespace Converse\Chat\Policies;

use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Models\Conversation;
use Illuminate\Contracts\Auth\Authenticatable;

class ConversationPolicy
{
    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function view(Authenticatable $user, Conversation $conversation): bool
    {
        return $this->participants->isActiveParticipant($conversation->id, $user->getAuthIdentifier());
    }

    public function create(Authenticatable $user): bool
    {
        return true;
    }

    public function update(Authenticatable $user, Conversation $conversation): bool
    {
        if ($conversation->isPrivate()) {
            return false;
        }

        return $this->isAdmin($user, $conversation);
    }

    public function updateAvatar(Authenticatable $user, Conversation $conversation): bool
    {
        return $this->update($user, $conversation);
    }

    public function manageParticipants(Authenticatable $user, Conversation $conversation): bool
    {
        return $this->isAdmin($user, $conversation);
    }

    protected function isAdmin(Authenticatable $user, Conversation $conversation): bool
    {
        $participant = $this->participants->findForUser($conversation->id, $user->getAuthIdentifier());

        return $participant !== null && $participant->left_at === null && $participant->isAdmin();
    }
}
