<?php

use Converse\Chat\Enums\MessageType;
use Converse\Chat\Models\Message;
use Converse\Chat\Notifications\NewChatMessageNotification;

it('always includes the broadcast channel and appends configured extra channels', function () {
    $message = new Message([
        'conversation_id' => 1,
        'chatable_type' => 'user',
        'chatable_id' => 1,
        'type' => MessageType::Text->value,
        'body' => 'hi',
    ]);

    $notification = new NewChatMessageNotification($message);

    expect($notification->via(null))->toBe(['broadcast']);

    config(['chat.notifications.channels' => ['fcm']]);

    expect($notification->via(null))->toBe(['broadcast', 'fcm']);
});
