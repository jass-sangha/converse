<?php

namespace Riwaaq\Chat\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallSignal implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  array<string, mixed>  $payload
     * @param  string[]  $recipientChannels  "chatable.{type}.{id}" personal channels of the other
     *                                       participant(s), joined at app boot regardless of which
     *                                       conversation is open — so an incoming call reaches them
     *                                       even when this conversation isn't the active one.
     */
    public function __construct(
        public int $conversationId,
        public Model $chatable,
        public array $payload,
        public array $recipientChannels,
    ) {}

    public function broadcastOn(): array
    {
        return array_map(
            fn (string $name) => new PrivateChannel($name),
            $this->recipientChannels,
        );
    }

    public function broadcastAs(): string
    {
        return 'call.signal';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'from_type' => $this->chatable->getMorphClass(),
            'from_id' => $this->chatable->getKey(),
            'payload' => $this->payload,
        ];
    }
}
