<?php

namespace Converse\Chat\Events;

use Converse\Chat\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message,
    ) {}

    public function broadcastOn(): array
    {
        return [new PresenceChannel("conversation.{$this->message->conversation_id}")];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'user_id' => $this->message->user_id,
            'type' => $this->message->type?->value,
            'body' => $this->message->body,
            'metadata' => $this->message->metadata,
            'reply_to_message_id' => $this->message->reply_to_message_id,
            'is_forwarded' => $this->message->is_forwarded,
            'created_at' => $this->message->created_at?->toIso8601String(),
        ];
    }
}
