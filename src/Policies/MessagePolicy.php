<?php

namespace Riwaaq\Chat\Policies;

use Illuminate\Database\Eloquent\Model;
use Riwaaq\Chat\Contracts\ParticipantRepositoryInterface;
use Riwaaq\Chat\Enums\ConversationType;
use Riwaaq\Chat\Enums\MessageType;
use Riwaaq\Chat\Enums\ParticipantRole;
use Riwaaq\Chat\Models\Message;

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
        // Without this, a vote on a non-poll message 422s only by accident: PollVoteService
        // reads $message->metadata['options'] ?? [], and an empty array happens to fail every
        // option-index bounds check. Explicit here so that behavior isn't load-bearing.
        return $message->type === MessageType::Poll && $this->isActiveParticipant($message, $user);
    }

    public function rsvp(Model $user, Message $message): bool
    {
        // EventRsvpService::respond() never reads message metadata before writing, so without
        // this an RSVP on a non-event message would silently succeed and create a real EventRsvp
        // row against an arbitrary message — not a security hole (still scoped to the caller's
        // own RSVP on a message they can already see), but a data-integrity gap.
        return $message->type === MessageType::Event && $this->isActiveParticipant($message, $user);
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
        // "Admin" only means something for a group — a private conversation's creator gets the
        // same role value as a data-model artifact of how participant rows are seeded, not
        // because a 1:1 chat has an admin. Without this guard, the sender of a private message
        // would be able to delete it for everyone past the window purely by having started the
        // conversation.
        if ($message->conversation->type !== ConversationType::Group) {
            return false;
        }

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
