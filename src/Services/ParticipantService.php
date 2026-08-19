<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\ParticipantRepositoryInterface;
use Riwaaq\Chat\Contracts\ParticipantServiceInterface;
use Riwaaq\Chat\Enums\ParticipantRole;
use Riwaaq\Chat\Events\ParticipantAdded;
use Riwaaq\Chat\Events\ParticipantRemoved;
use Riwaaq\Chat\Events\ParticipantRoleChanged;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Traits\SendsSystemMessages;

class ParticipantService implements ParticipantServiceInterface
{
    use SendsSystemMessages;

    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function addParticipants(Conversation $conversation, Collection $chatables, Model $actor): Message
    {
        $chatables = $chatables->unique(fn (Model $chatable) => Chat::identify($chatable))->values();

        $this->participants->addMany($conversation->id, $chatables);

        $message = $this->sendSystemMessage($conversation, 'participant_added', [
            'actor_type' => $actor->getMorphClass(),
            'actor_id' => $actor->getKey(),
            'targets' => $chatables->map(fn (Model $c) => ['type' => $c->getMorphClass(), 'id' => $c->getKey()])->values()->all(),
        ]);

        broadcast(new ParticipantAdded($conversation->id, $chatables, $actor))->toOthers();

        return $message;
    }

    public function removeParticipant(Conversation $conversation, Model $target, Model $actor): Message
    {
        $this->guardAgainstRemovingSoleAdmin($conversation, $target);

        $this->participants->remove($conversation->id, $target);

        $message = $this->sendSystemMessage($conversation, 'participant_removed', [
            'actor_type' => $actor->getMorphClass(),
            'actor_id' => $actor->getKey(),
            'target_type' => $target->getMorphClass(),
            'target_id' => $target->getKey(),
        ]);

        broadcast(new ParticipantRemoved($conversation->id, $target, $actor))->toOthers();

        return $message;
    }

    public function changeRole(Conversation $conversation, Model $target, string $role): Message
    {
        $role = ParticipantRole::from($role);

        if ($role === ParticipantRole::Member) {
            $this->guardAgainstRemovingSoleAdmin($conversation, $target);
        }

        $participant = $this->participants->findFor($conversation->id, $target);
        abort_if($participant === null, 404);

        $participant->update(['role' => $role]);

        $message = $this->sendSystemMessage($conversation, 'participant_role_changed', [
            'target_type' => $target->getMorphClass(),
            'target_id' => $target->getKey(),
            'role' => $role->value,
        ]);

        broadcast(new ParticipantRoleChanged($conversation->id, $target, $role->value))->toOthers();

        return $message;
    }

    public function leaveGroup(Conversation $conversation, Model $chatable): void
    {
        $identity = Chat::identify($chatable);

        $otherMembers = $this->participants->activeChatables($conversation->id)
            ->reject(fn (Model $c) => Chat::identify($c) === $identity);

        if ($otherMembers->isNotEmpty()) {
            $this->guardAgainstRemovingSoleAdmin($conversation, $chatable);
        }

        $this->participants->remove($conversation->id, $chatable);

        $this->sendSystemMessage($conversation, 'participant_left', [
            'target_type' => $chatable->getMorphClass(),
            'target_id' => $chatable->getKey(),
        ]);

        broadcast(new ParticipantRemoved($conversation->id, $chatable, $chatable))->toOthers();
    }

    protected function guardAgainstRemovingSoleAdmin(Conversation $conversation, Model $chatable): void
    {
        $participant = $this->participants->findFor($conversation->id, $chatable);

        if ($participant === null || $participant->role !== ParticipantRole::Admin) {
            return;
        }

        if ($this->participants->adminCount($conversation->id) <= 1) {
            throw ValidationException::withMessages([
                'participant' => 'You are the only admin. Promote another participant before leaving or stepping down.',
            ]);
        }
    }
}
