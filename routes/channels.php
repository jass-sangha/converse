<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Broadcast;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\ParticipantRepositoryInterface;

Broadcast::channel('conversation.{conversationId}', function (Model $chatable, int $conversationId) {
    $isParticipant = app(ParticipantRepositoryInterface::class)
        ->isActiveParticipant($conversationId, $chatable);

    if (! $isParticipant) {
        return false;
    }

    // Array return makes this usable as a presence channel (Echo.join()),
    // enabling client-side whisper() typing indicators with zero backend cost.
    return ['id' => Chat::identify($chatable)];
});

// Personal channel, keyed by the chatable's morph alias + id rather than a bare numeric
// id, since more than one chatable model can share the same id space (a User #5 and an
// Agent #5 must not be able to eavesdrop on each other's personal channel).
Broadcast::channel('chatable.{type}.{id}', function (Model $chatable, string $type, int|string $id) {
    return $chatable->getMorphClass() === $type && (string) $chatable->getKey() === (string) $id;
});
