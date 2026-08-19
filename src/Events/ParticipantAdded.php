<?php

namespace Riwaaq\Chat\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class ParticipantAdded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  Collection<int, Model>  $chatables
     */
    public function __construct(
        public int $conversationId,
        public Collection $chatables,
        public Model $actor,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel("conversation.{$this->conversationId}"),
            // Newly-added participants aren't subscribed to the conversation channel yet
            // (they don't know it exists) — push to their personal channel too.
            ...$this->chatables
                ->map(fn (Model $chatable) => new PrivateChannel("chatable.{$chatable->getMorphClass()}.{$chatable->getKey()}"))
                ->all(),
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
            'chatables' => $this->chatables
                ->map(fn (Model $chatable) => ['type' => $chatable->getMorphClass(), 'id' => $chatable->getKey()])
                ->values(),
            'actor_type' => $this->actor->getMorphClass(),
            'actor_id' => $this->actor->getKey(),
        ];
    }
}
