<?php

namespace Riwaaq\Chat\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $conversationId,
        public Model $chatable,
    ) {}

    public function broadcastOn(): array
    {
        return [new PresenceChannel("conversation.{$this->conversationId}")];
    }

    public function broadcastAs(): string
    {
        return 'typing.start';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'chatable_type' => $this->chatable->getMorphClass(),
            'chatable_id' => $this->chatable->getKey(),
        ];
    }
}
