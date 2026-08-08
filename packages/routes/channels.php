<?php

use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{conversationId}', function ($user, int $conversationId) {
    $isParticipant = app(ParticipantRepositoryInterface::class)
        ->isActiveParticipant($conversationId, $user->getAuthIdentifier());

    if (! $isParticipant) {
        return false;
    }

    // Array return makes this usable as a presence channel (Echo.join()),
    // enabling client-side whisper() typing indicators with zero backend cost.
    return ['id' => $user->getAuthIdentifier()];
});

Broadcast::channel('user.{userId}', function ($user, int $userId) {
    return (int) $user->getAuthIdentifier() === $userId;
});
