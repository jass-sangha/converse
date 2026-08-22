<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\PresenceServiceInterface;
use Riwaaq\Chat\Contracts\UserSettingsServiceInterface;
use Riwaaq\Chat\Events\PresenceChanged;
use Riwaaq\Chat\Models\ConversationParticipant;
use Riwaaq\Chat\Models\UserPresence;

class PresenceService implements PresenceServiceInterface
{
    public function __construct(
        protected UserSettingsServiceInterface $settings,
    ) {}

    public function heartbeat(Model $chatable): void
    {
        $ttl = config('chat.presence.heartbeat_ttl_seconds', 60) + config('chat.presence.online_grace_seconds', 90);
        $onlineKey = $this->onlineKey($chatable);
        $wasOnline = Cache::has($onlineKey);

        Cache::put($onlineKey, true, $ttl);

        if (! $wasOnline) {
            $this->markOnlineAndBroadcast($chatable);

            return;
        }

        // Debounce durable last_seen_at writes to at most once per heartbeat window.
        $lockKey = $this->lastSeenLockKey($chatable);

        if (Cache::add($lockKey, true, config('chat.presence.heartbeat_ttl_seconds', 60))) {
            UserPresence::query()->updateOrCreate(
                ['chatable_type' => $chatable->getMorphClass(), 'chatable_id' => $chatable->getKey()],
                ['last_seen_at' => now(), 'is_online' => true],
            );
        }
    }

    public function status(Model $chatable, ?Model $viewer = null): array
    {
        $isOnline = Cache::has($this->onlineKey($chatable));
        $row = Chat::whereChatable(UserPresence::query(), $chatable)->first();

        $viewerIsSelf = $viewer !== null && Chat::identify($viewer) === Chat::identify($chatable);

        $sharingAllowed = $viewer === null
            || $viewerIsSelf
            || ($this->settings->allowsLastSeen($chatable) && $this->settings->allowsLastSeen($viewer));

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

        $count = 0;

        // Chunked, not get() — same reasoning as PruneExpiredMessagesCommand's chunkById(200):
        // a mass-disconnect (server restart, network partition, WebSocket bounce) means every
        // currently-online row goes stale for the same sweep, right as the system is already
        // under reconnection load. Already-updated rows drop out of the `is_online = true`
        // filter on their own, so advancing by id this way never re-processes or skips a row.
        UserPresence::query()
            ->where('is_online', true)
            ->where('last_seen_at', '<', $threshold)
            ->with('chatable')
            ->chunkById(200, function (Collection $stale) use (&$count) {
                foreach ($stale as $presence) {
                    $chatable = $presence->chatable;

                    if ($chatable === null) {
                        $presence->update(['is_online' => false]);

                        continue;
                    }

                    Cache::forget($this->onlineKey($chatable));
                    $presence->update(['is_online' => false]);

                    $conversationIds = Chat::whereChatable(ConversationParticipant::query(), $chatable)
                        ->whereNull('left_at')
                        ->pluck('conversation_id')
                        ->all();

                    if (! empty($conversationIds)) {
                        broadcast(new PresenceChanged(
                            $chatable,
                            false,
                            $this->settings->allowsLastSeen($chatable) ? $presence->last_seen_at?->toIso8601String() : null,
                            $conversationIds,
                        ));
                    }
                }

                $count += $stale->count();
            });

        return $count;
    }

    protected function markOnlineAndBroadcast(Model $chatable): void
    {
        $presence = UserPresence::query()->updateOrCreate(
            ['chatable_type' => $chatable->getMorphClass(), 'chatable_id' => $chatable->getKey()],
            ['is_online' => true, 'last_seen_at' => now()],
        );

        $conversationIds = Chat::whereChatable(ConversationParticipant::query(), $chatable)
            ->whereNull('left_at')
            ->pluck('conversation_id')
            ->all();

        if (! empty($conversationIds)) {
            $lastSeenAt = $this->settings->allowsLastSeen($chatable) ? $presence->last_seen_at?->toIso8601String() : null;

            broadcast(new PresenceChanged($chatable, true, $lastSeenAt, $conversationIds));
        }
    }

    protected function onlineKey(Model $chatable): string
    {
        return 'chat:presence:online:'.Chat::identify($chatable);
    }

    protected function lastSeenLockKey(Model $chatable): string
    {
        return 'chat:presence:lastseen-lock:'.Chat::identify($chatable);
    }
}
