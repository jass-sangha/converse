<?php

namespace Riwaaq\Chat\Traits;

use Riwaaq\Chat\Enums\MessageType;
use Riwaaq\Chat\Events\MessageSent;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;

trait SendsSystemMessages
{
    /**
     * System messages carry a structured event + metadata payload rather than a
     * hardcoded English sentence, so the consuming app's client can render and
     * localize the text itself (e.g. "Alice added Bob") from known user data.
     */
    protected function sendSystemMessage(Conversation $conversation, string $event, array $metadata = []): Message
    {
        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'chatable_type' => null,
            'chatable_id' => null,
            'type' => MessageType::System->value,
            'metadata' => ['event' => $event, ...$metadata],
        ]);

        $conversation->forceFill(['last_activity_at' => now()])->save();

        // No client optimistically inserts this locally the way a sent message's own author
        // does — broadcast to everyone, including the actor who triggered it, so it appears
        // live for them too instead of only after their next reload.
        broadcast(new MessageSent($message));

        return $message;
    }
}
