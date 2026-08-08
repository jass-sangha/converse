<?php

namespace Converse\Chat\Repositories;

use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Enums\ParticipantRole;
use Converse\Chat\Models\ConversationParticipant;
use Illuminate\Support\Collection;

class ParticipantRepository implements ParticipantRepositoryInterface
{
    public function addMany(int $conversationId, array $userIds, ?int $adminUserId = null): void
    {
        $now = now();

        $rows = array_map(fn (int $userId) => [
            'conversation_id' => $conversationId,
            'user_id' => $userId,
            'role' => $userId === $adminUserId ? ParticipantRole::Admin->value : ParticipantRole::Member->value,
            'joined_at' => $now,
            'left_at' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ], array_unique($userIds));

        ConversationParticipant::query()->upsert(
            $rows,
            ['conversation_id', 'user_id'],
            ['role', 'left_at', 'joined_at', 'updated_at']
        );
    }

    public function findForUser(int $conversationId, int $userId): ?ConversationParticipant
    {
        return ConversationParticipant::query()
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->first();
    }

    public function isActiveParticipant(int $conversationId, int $userId): bool
    {
        return ConversationParticipant::query()
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->whereNull('left_at')
            ->exists();
    }

    public function activeUserIds(int $conversationId): array
    {
        return ConversationParticipant::query()
            ->where('conversation_id', $conversationId)
            ->whereNull('left_at')
            ->pluck('user_id')
            ->all();
    }

    public function activeForConversation(int $conversationId): Collection
    {
        return ConversationParticipant::query()
            ->where('conversation_id', $conversationId)
            ->whereNull('left_at')
            ->get();
    }

    public function remove(int $conversationId, int $userId): void
    {
        ConversationParticipant::query()
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->update(['left_at' => now()]);
    }

    public function clearHiddenForOthers(int $conversationId, int $exceptUserId): void
    {
        ConversationParticipant::query()
            ->where('conversation_id', $conversationId)
            ->where('user_id', '!=', $exceptUserId)
            ->whereNotNull('hidden_at')
            ->update(['hidden_at' => null]);
    }

    public function adminCount(int $conversationId): int
    {
        return ConversationParticipant::query()
            ->where('conversation_id', $conversationId)
            ->whereNull('left_at')
            ->where('role', ParticipantRole::Admin->value)
            ->count();
    }
}
