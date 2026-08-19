<?php

namespace Riwaaq\Chat\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Riwaaq\Chat\Models\Message;

class NewChatMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Message $message,
    ) {}

    /**
     * Ships with only 'broadcast' wired by default — no push SDK dependency.
     * Add channel names (e.g. 'fcm', 'webpush') via config('chat.notifications.channels')
     * once the consuming app has installed and configured that channel package,
     * and implement the corresponding `to*()` method on a published subclass.
     */
    public function via(mixed $notifiable): array
    {
        return array_merge(['broadcast'], config('chat.notifications.channels', []));
    }

    public function toBroadcast(mixed $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'conversation_id' => $this->message->conversation_id,
            'message_id' => $this->message->id,
            'sender_type' => $this->message->chatable_type,
            'sender_id' => $this->message->chatable_id,
            'type' => $this->message->type?->value,
            'preview' => str($this->message->body ?? '')->limit(120)->toString(),
        ]);
    }

    public function toArray(mixed $notifiable): array
    {
        return [
            'conversation_id' => $this->message->conversation_id,
            'message_id' => $this->message->id,
            'sender_type' => $this->message->chatable_type,
            'sender_id' => $this->message->chatable_id,
        ];
    }
}
