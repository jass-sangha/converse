<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\PresenceServiceInterface;
use Converse\Chat\Contracts\UserSettingsServiceInterface;
use Converse\Chat\Events\PresenceChanged;
use Converse\Chat\Models\ConversationParticipant;
use Converse\Chat\Models\UserPresence;
use Illuminate\Support\Facades\Cache;

class PresenceService implements PresenceServiceInterface
{
    public function __construct(
        protected UserSettingsServiceInterface $settings,
    ) {}

    public function heartbeat(int $userId): void
    {
        $ttl = config('chat.presence.heartbeat_ttl_seconds', 60) + config('chat.presence.online_grace_seconds', 90);
        $onlineKey = $this->onlineKey($userId);
        $wasOnline = Cache::has($onlineKey);

        Cache::put($onlineKey, true, $ttl);

        if (! $wasOnline) {
            $this->markOnlineAndBroadcast($userId);

            return;
        }

        // Debounce durable last_seen_at writes to at most once per heartbeat window.
        $lockKey = $this->lastSeenLockKey($userId);

        if (Cache::add($lockKey, true, config('chat.presence.heartbeat_ttl_seconds', 60))) {
            UserPresence::query()->updateOrCreate(
                ['user_id' => $userId],
                ['last_seen_at' => now(), 'is_online' => true],
            );
        }
    }

    public function status(int $userId, ?int $viewerUserId = null): array
    {
        $isOnline = Cache::has($this->onlineKey($userId));
        $row = UserPresence::query()->find($userId);

        $sharingAllowed = $viewerUserId === null
            || $viewerUserId === $userId
            || ($this->settings->allowsLastSeen($userId) && $this->settings->allowsLastSeen($viewerUserId));

        if (! $sharingAllowed) {
            return [
                'is_online' => false,
                'last_seen_at' => null,
            ];
        }

        return [
            'is_online' => $isOnline,
            'last_seen_at' => $row?->last_seen_at?->toIso8601String(),
        ];
    }

    public function sweepStale(): int
    {
        $threshold = now()->subSeconds(
            config('chat.presence.heartbeat_ttl_seconds', 60) + config('chat.presence.online_grace_seconds', 90)
        );

        $stale = UserPresence::query()
            ->where('is_online', true)
            ->where('last_seen_at', '<', $threshold)
            ->get();

        foreach ($stale as $presence) {
            Cache::forget($this->onlineKey($presence->user_id));
            $presence->update(['is_online' => false]);

            $conversationIds = ConversationParticipant::query()
                ->where('user_id', $presence->user_id)
                ->whereNull('left_at')
                ->pluck('conversation_id')
                ->all();

            if (! empty($conversationIds)) {
                broadcast(new PresenceChanged(
                    $presence->user_id,
                    false,
                    $this->settings->allowsLastSeen($presence->user_id) ? $presence->last_seen_at?->toIso8601String() : null,
                    $conversationIds,
                ));
            }
        }

        return $stale->count();
    }

    protected function markOnlineAndBroadcast(int $userId): void
    {
        $presence = UserPresence::query()->updateOrCreate(
            ['user_id' => $userId],
            ['is_online' => true, 'last_seen_at' => now()],
        );

        $conversationIds = ConversationParticipant::query()
            ->where('user_id', $userId)
            ->whereNull('left_at')
            ->pluck('conversation_id')
            ->all();

        if (! empty($conversationIds)) {
            $lastSeenAt = $this->settings->allowsLastSeen($userId) ? $presence->last_seen_at?->toIso8601String() : null;

            broadcast(new PresenceChanged($userId, true, $lastSeenAt, $conversationIds));
        }
    }

    protected function onlineKey(int $userId): string
    {
        return "chat:presence:online:{$userId}";
    }

    protected function lastSeenLockKey(int $userId): string
    {
        return "chat:presence:lastseen-lock:{$userId}";
    }
}
