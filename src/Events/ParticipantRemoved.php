<?php

namespace Riwaaq\Chat\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ParticipantRemoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $conversationId,
        public Model $target,
        public Model $actor,
    ) {}

    public function broadcastOn(): array
    {
        return [new PresenceChannel("conversation.{$this->conversationId}")];
    }

    public function broadcastAs(): string
    {
        return 'participant.removed';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'chatable_type' => $this->target->getMorphClass(),
            'chatable_id' => $this->target->getKey(),
            'actor_type' => $this->actor->getMorphClass(),
            'actor_id' => $this->actor->getKey(),
        ];
    }
}
