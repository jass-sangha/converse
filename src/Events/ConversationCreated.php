<?php

namespace Riwaaq\Chat\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class ConversationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  Collection<int, Model>  $participants
     */
    public function __construct(
        public int $conversationId,
        public Collection $participants,
    ) {}

    public function broadcastOn(): array
    {
        return $this->participants
            ->map(fn (Model $chatable) => new PrivateChannel("chatable.{$chatable->getMorphClass()}.{$chatable->getKey()}"))
            ->all();
    }

    public function broadcastAs(): string
    {
        return 'conversation.created';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
        ];
    }
}
