<?php

namespace Converse\Chat\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PresenceChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  int[]  $conversationIds  Conversations the user is an active participant of.
     */
    public function __construct(
        public int $userId,
        public bool $isOnline,
        public ?string $lastSeenAt,
        public array $conversationIds,
    ) {}

    public function broadcastOn(): array
    {
        return array_map(
            fn (int $conversationId) => new PresenceChannel("conversation.{$conversationId}"),
            $this->conversationIds,
        );
    }

    public function broadcastAs(): string
    {
        return 'presence.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'is_online' => $this->isOnline,
            'last_seen_at' => $this->lastSeenAt,
        ];
    }
}
