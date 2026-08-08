<?php

namespace Converse\Chat\Traits;

use Converse\Chat\Enums\MessageType;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;

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
            'user_id' => null,
            'type' => MessageType::System->value,
            'metadata' => ['event' => $event, ...$metadata],
        ]);

        $conversation->forceFill(['last_activity_at' => now()])->save();

        return $message;
    }
}
