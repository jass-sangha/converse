<?php

namespace Riwaaq\Chat\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\ParticipantRepositoryInterface;
use Riwaaq\Chat\Enums\ParticipantRole;
use Riwaaq\Chat\Models\ConversationParticipant;

class ParticipantRepository implements ParticipantRepositoryInterface
{
    public function addMany(int $conversationId, Collection $chatables, ?Model $admin = null): void
    {
        $now = now();
        $adminIdentity = $admin ? Chat::identify($admin) : null;

        $rows = $chatables
            ->unique(fn (Model $chatable) => Chat::identify($chatable))
            ->map(fn (Model $chatable) => [
                'conversation_id' => $conversationId,
                'chatable_type' => $chatable->getMorphClass(),
                'chatable_id' => $chatable->getKey(),
                'role' => Chat::identify($chatable) === $adminIdentity ? ParticipantRole::Admin->value : ParticipantRole::Member->value,
                'joined_at' => $now,
                'left_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->values()
            ->all();

        ConversationParticipant::query()->upsert(
            $rows,
            ['conversation_id', 'chatable_type', 'chatable_id'],
            ['role', 'left_at', 'joined_at', 'updated_at']
        );
    }

    public function findFor(int $conversationId, Model $chatable): ?ConversationParticipant
    {
        return Chat::whereChatable(
            ConversationParticipant::query()->where('conversation_id', $conversationId),
            $chatable
        )->first();
    }

    public function isActiveParticipant(int $conversationId, Model $chatable): bool
    {
        return Chat::whereChatable(
            ConversationParticipant::query()->where('conversation_id', $conversationId),
            $chatable
        )->whereNull('left_at')->exists();
    }

    public function activeParticipantConversationIds(array $conversationIds, Model $chatable): array
    {
        if ($conversationIds === []) {
            return [];
        }

        return Chat::whereChatable(
            ConversationParticipant::query()->whereIn('conversation_id', $conversationIds),
            $chatable
        )->whereNull('left_at')->pluck('conversation_id')->all();
    }

    public function activeChatables(int $conversationId): Collection
    {
        return ConversationParticipant::query()
            ->where('conversation_id', $conversationId)
            ->whereNull('left_at')
            ->with('chatable')
            ->get()
            ->pluck('chatable')
            ->filter()
            ->values();
    }

    public function activeForConversation(int $conversationId): Collection
    {
        return ConversationParticipant::query()
            ->where('conversation_id', $conversationId)
            ->whereNull('left_at')
            ->get();
    }

    public function remove(int $conversationId, Model $chatable): void
    {
        Chat::whereChatable(
            ConversationParticipant::query()->where('conversation_id', $conversationId),
            $chatable
        )->update(['left_at' => now()]);
    }

    public function clearHiddenForOthers(int $conversationId, Model $except): void
    {
        ConversationParticipant::query()
            ->where('conversation_id', $conversationId)
            ->where(fn ($q) => $q
                ->where('chatable_type', '!=', $except->getMorphClass())
                ->orWhere('chatable_id', '!=', $except->getKey())
            )
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
