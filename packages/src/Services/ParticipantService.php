<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Contracts\ParticipantServiceInterface;
use Converse\Chat\Enums\ParticipantRole;
use Converse\Chat\Events\ParticipantAdded;
use Converse\Chat\Events\ParticipantRemoved;
use Converse\Chat\Events\ParticipantRoleChanged;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Traits\SendsSystemMessages;
use Illuminate\Validation\ValidationException;

class ParticipantService implements ParticipantServiceInterface
{
    use SendsSystemMessages;

    public function __construct(
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function addParticipants(Conversation $conversation, array $userIds, int $actingUserId): void
    {
        $userIds = array_values(array_unique($userIds));

        $this->participants->addMany($conversation->id, $userIds);

        $this->sendSystemMessage($conversation, 'participant_added', [
            'actor_id' => $actingUserId,
            'target_ids' => $userIds,
        ]);

        broadcast(new ParticipantAdded($conversation->id, $userIds, $actingUserId))->toOthers();
    }

    public function removeParticipant(Conversation $conversation, int $targetUserId, int $actingUserId): void
    {
        $this->guardAgainstRemovingSoleAdmin($conversation, $targetUserId);

        $this->participants->remove($conversation->id, $targetUserId);

        $this->sendSystemMessage($conversation, 'participant_removed', [
            'actor_id' => $actingUserId,
            'target_id' => $targetUserId,
        ]);

        broadcast(new ParticipantRemoved($conversation->id, $targetUserId, $actingUserId))->toOthers();
    }

    public function changeRole(Conversation $conversation, int $targetUserId, string $role): void
    {
        $role = ParticipantRole::from($role);

        if ($role === ParticipantRole::Member) {
            $this->guardAgainstRemovingSoleAdmin($conversation, $targetUserId);
        }

        $participant = $this->participants->findForUser($conversation->id, $targetUserId);
        abort_if($participant === null, 404);

        $participant->update(['role' => $role]);

        $this->sendSystemMessage($conversation, 'participant_role_changed', [
            'target_id' => $targetUserId,
            'role' => $role->value,
        ]);

        broadcast(new ParticipantRoleChanged($conversation->id, $targetUserId, $role->value))->toOthers();
    }

    public function leaveGroup(Conversation $conversation, int $userId): void
    {
        $remainingActive = $this->participants->activeUserIds($conversation->id);
        $otherMembers = array_values(array_diff($remainingActive, [$userId]));

        if (! empty($otherMembers)) {
            $this->guardAgainstRemovingSoleAdmin($conversation, $userId);
        }

        $this->participants->remove($conversation->id, $userId);

        $this->sendSystemMessage($conversation, 'participant_left', [
            'target_id' => $userId,
        ]);

        broadcast(new ParticipantRemoved($conversation->id, $userId, $userId))->toOthers();
    }

    protected function guardAgainstRemovingSoleAdmin(Conversation $conversation, int $userId): void
    {
        $participant = $this->participants->findForUser($conversation->id, $userId);

        if ($participant === null || $participant->role !== ParticipantRole::Admin) {
            return;
        }

        if ($this->participants->adminCount($conversation->id) <= 1) {
            throw ValidationException::withMessages([
                'user_id' => 'You are the only admin. Promote another participant before leaving or stepping down.',
            ]);
        }
    }
}
