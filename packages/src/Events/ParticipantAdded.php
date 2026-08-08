<?php

namespace Converse\Chat\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ParticipantAdded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $conversationId,
        public array $userIds,
        public int $actorId,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel("conversation.{$this->conversationId}"),
            // Newly-added users aren't subscribed to the conversation channel yet
            // (they don't know it exists) — push to their personal channel too.
            ...array_map(fn (int $userId) => new PrivateChannel("user.{$userId}"), $this->userIds),
        ];
    }

    public function broadcastAs(): string
    {
        return 'participant.added';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'user_ids' => $this->userIds,
            'actor_id' => $this->actorId,
        ];
    }
}
