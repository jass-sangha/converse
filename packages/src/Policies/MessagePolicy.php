<?php

namespace Converse\Chat\Policies;

use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Enums\MessageType;
use Converse\Chat\Enums\ParticipantRole;
use Converse\Chat\Models\Message;
use Illuminate\Database\Eloquent\Model;

class MessagePolicy
{
    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function view(Model $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function react(Model $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function vote(Model $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function rsvp(Model $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function star(Model $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function pin(Model $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function forward(Model $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function deleteForMe(Model $user, Message $message): bool
    {
        return $this->isActiveParticipant($message, $user);
    }

    public function update(Model $user, Message $message): bool
    {
        if (! $this->isSender($message, $user)) {
            return false;
        }

        if ($message->type !== MessageType::Text) {
            return false;
        }

        return ! $this->pastWindow($message, config('chat.message.edit_window_minutes'));
    }

    public function delete(Model $user, Message $message): bool
    {
        if ($this->isSender($message, $user)) {
            $window = config('chat.message.delete_for_everyone_window_minutes');

            if (! $this->pastWindow($message, $window)) {
                return true;
            }
        }

        return $this->isAdmin($message, $user);
    }

    protected function isSender(Message $message, Model $user): bool
    {
        return $message->chatable_type === $user->getMorphClass()
            && $message->chatable_id === $user->getKey();
    }

    protected function isActiveParticipant(Message $message, Model $user): bool
    {
        return $this->participants->isActiveParticipant($message->conversation_id, $user);
    }

    protected function isAdmin(Message $message, Model $user): bool
    {
        $participant = $this->participants->findFor($message->conversation_id, $user);

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
