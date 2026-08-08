<?php

namespace Converse\Chat\Policies;

use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Enums\MessageType;
use Converse\Chat\Enums\ParticipantRole;
use Converse\Chat\Models\Message;
use Illuminate\Contracts\Auth\Authenticatable;

class MessagePolicy
{
    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function view(Authenticatable $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function react(Authenticatable $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function star(Authenticatable $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function pin(Authenticatable $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function forward(Authenticatable $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function deleteForMe(Authenticatable $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function update(Authenticatable $user, Message $message): bool
    {
        if ($message->user_id !== $user->getAuthIdentifier()) {
            return false;
        }

        if ($message->type !== MessageType::Text) {
            return false;
        }

        return ! $this->pastWindow($message, config('chat.message.edit_window_minutes'));
    }

    public function delete(Authenticatable $user, Message $message): bool
    {
        $userId = $user->getAuthIdentifier();

        if ($message->user_id === $userId) {
            $window = config('chat.message.delete_for_everyone_window_minutes');

            if (! $this->pastWindow($message, $window)) {
                return true;
            }
        }

        return $this->isAdmin($message, $userId);
    }

    protected function isActiveParticipant(Message $message, Authenticatable $user): bool
    {
        return $this->participants->isActiveParticipant($message->conversation_id, $user->getAuthIdentifier());
    }

    protected function isAdmin(Message $message, int $userId): bool
    {
        $participant = $this->participants->findForUser($message->conversation_id, $userId);

        return $participant !== null
            && $participant->left_at === null
            && $participant->role === ParticipantRole::Admin;
    }

    protected function pastWindow(Message $message, ?int $windowMinutes): bool
    {
        if ($windowMinutes === null) {
            return false;
        }

        return $message->created_at->addMinutes($windowMinutes)->isPast();
    }
}
