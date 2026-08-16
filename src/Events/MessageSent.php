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
    ) {
        $this->message->loadMissing(['attachments', 'replyTo.attachments']);
    }

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
            'chatable_type' => $this->message->chatable_type,
            'chatable_id' => $this->message->chatable_id,
            'type' => $this->message->type?->value,
            'body' => $this->message->body,
            'metadata' => $this->message->metadata,
            'reply_to_message_id' => $this->message->reply_to_message_id,
            'reply_to' => $this->message->replyTo ? $this->serializeReplyTo($this->message->replyTo) : null,
            'is_forwarded' => $this->message->is_forwarded,
            'attachments' => $this->message->attachments->map(fn ($attachment) => $this->serializeAttachment($attachment))->values(),
            'created_at' => $this->message->created_at?->toIso8601String(),
        ];
    }

    // Mirrors MessageResource's reply_to/attachment shape — kept independent of it since a
    // broadcast payload is shared by every recipient at once and can only carry
    // viewer-independent fields (no is_starred_by_me / reaction "self", which differ per
    // recipient and are pushed via their own dedicated events instead).
    protected function serializeReplyTo(Message $replyTo): array
    {
        return [
            'id' => $replyTo->id,
            'chatable_type' => $replyTo->chatable_type,
            'chatable_id' => $replyTo->chatable_id,
            'type' => $replyTo->type?->value,
            'body' => str($replyTo->body ?? '')->limit(100)->toString(),
            'metadata' => $replyTo->metadata,
            'deleted_for_everyone' => $replyTo->isDeletedForEveryone(),
            'attachments' => $replyTo->attachments->map(fn ($attachment) => $this->serializeAttachment($attachment))->values(),
        ];
    }

    protected function serializeAttachment(mixed $attachment): array
    {
        return [
            'id' => $attachment->id,
            'url' => $attachment->url,
            'thumbnail_url' => $attachment->thumbnail_url,
            'mime_type' => $attachment->mime_type,
            'original_filename' => $attachment->original_filename,
            'size_bytes' => $attachment->size_bytes,
            'width' => $attachment->width,
            'height' => $attachment->height,
            'duration_seconds' => $attachment->duration_seconds,
        ];
    }
}
