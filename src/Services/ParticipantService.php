<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
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

    // StoreConversationRequest/AddParticipantsRequest cap a single request's participants array
    // at this same number, but that only bounds one call — nothing stopped repeated
    // add-participants calls from pushing a conversation's *total* membership past it, silently
    // reintroducing the receipt/broadcast fan-out cost (one MessageReceipt row and one
    // receipts.chatable eager load per participant per message) the cap exists to bound. This
    // is the actual enforcement point; the request rules are just an early, cheap rejection.
    public const MAX_PARTICIPANTS_PER_CONVERSATION = 200;

    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function addParticipants(Conversation $conversation, Collection $chatables, Model $actor): Message
    {
        $chatables = $chatables->unique(fn (Model $chatable) => Chat::identify($chatable))->values();

        return DB::transaction(function () use ($conversation, $chatables, $actor) {
            // Locks the conversation row so two concurrent add-participants calls on the same
            // conversation serialize instead of both reading the same pre-add active count and
            // both landing under the cap.
            Conversation::query()->whereKey($conversation->id)->lockForUpdate()->first();

            $activeCount = $this->participants->activeCount($conversation->id);

            abort_if(
                $activeCount + $chatables->count() > self::MAX_PARTICIPANTS_PER_CONVERSATION,
                422,
                'A conversation cannot have more than '.self::MAX_PARTICIPANTS_PER_CONVERSATION.' participants.'
            );

            $this->participants->addMany($conversation->id, $chatables);

            $message = $this->sendSystemMessage($conversation, 'participant_added', [
                'actor_type' => $actor->getMorphClass(),
                'actor_id' => $actor->getKey(),
                'targets' => $chatables->map(fn (Model $c) => ['type' => $c->getMorphClass(), 'id' => $c->getKey()])->values()->all(),
            ]);

            // Deferred to after commit — ParticipantAdded is ShouldBroadcast, and this transaction
            // exists specifically to hold the conversation-row lock through the participant-cap
            // check, so broadcasting from inside it risks a worker seeing this event before the
            // new participant rows are visible to any other connection.
            DB::afterCommit(fn () => broadcast(new ParticipantAdded($conversation->id, $chatables, $actor))->toOthers());

            return $message;
        });
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
