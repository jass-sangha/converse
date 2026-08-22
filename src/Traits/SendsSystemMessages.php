<?php

namespace Riwaaq\Chat\Traits;

use Illuminate\Support\Facades\DB;
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
        // live for them too instead of only after their next reload. Also broadcast on every
        // active participant's personal channel (not just the conversation's own), so the
        // sidebar updates live for whoever doesn't have this conversation open right now.
        //
        // Deferred via afterCommit(), not a bare call: this method is used by callers that wrap
        // it in their own open transaction (e.g. ParticipantService::addParticipants(), for its
        // participant-cap lock) — MessageSent is ShouldBroadcast, and Laravel's queue
        // connections default to after_commit=false, so broadcasting from inside a still-open
        // transaction risks a worker querying this message before it's visible to any other
        // connection. Runs immediately if no transaction is open, so this is a no-op change for
        // callers that don't wrap it.
        $participants = $this->participants->activeChatables($conversation->id);
        DB::afterCommit(fn () => broadcast(new MessageSent($message, $participants)));

        return $message;
    }
}
