<?php

namespace Converse\Chat\Http\Resources;

use Converse\Chat\Contracts\UserSettingsServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userId = $request->user()?->getAuthIdentifier();

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'user_id' => $this->user_id,
            'type' => $this->type?->value,
            'body' => $this->isDeletedForEveryone() ? null : $this->body,
            'is_forwarded' => $this->is_forwarded,
            'metadata' => $this->isDeletedForEveryone() ? null : $this->metadata,
            'edited_at' => $this->edited_at,
            'deleted_for_everyone' => $this->isDeletedForEveryone(),
            'reply_to' => $this->whenLoaded('replyTo', fn () => $this->replyTo ? [
                'id' => $this->replyTo->id,
                'user_id' => $this->replyTo->user_id,
                'body' => str($this->replyTo->body ?? '')->limit(100)->toString(),
            ] : null),
            'attachments' => $this->whenLoaded('attachments', fn () => $this->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'url' => $attachment->url,
                'thumbnail_url' => $attachment->thumbnail_url,
                'mime_type' => $attachment->mime_type,
                'original_filename' => $attachment->original_filename,
                'size_bytes' => $attachment->size_bytes,
                'width' => $attachment->width,
                'height' => $attachment->height,
                'duration_seconds' => $attachment->duration_seconds,
            ])),
            'reactions' => $this->whenLoaded('reactions', fn () => $this->reactions
                ->groupBy('emoji')
                ->map(fn ($group, $emoji) => [
                    'emoji' => $emoji,
                    'count' => $group->count(),
                    'self' => $group->contains('user_id', $userId),
                    'user_ids' => $group->pluck('user_id')->values(),
                ])
                ->values()),
            'status' => $this->whenLoaded('receipts', fn () => $this->receiptStatus($userId)),
            'is_starred_by_me' => $this->whenLoaded('starredBy', fn () => $this->starredBy->contains('user_id', $userId)),
            'is_pinned' => $this->whenLoaded('pinnedIn', fn () => $this->pinnedIn !== null, false),
            'conversation' => $this->whenLoaded('conversation', fn () => [
                'id' => $this->conversation->id,
                'name' => $this->conversation->name,
                'type' => $this->conversation->type?->value,
                'participants' => $this->conversation->relationLoaded('participants')
                    ? $this->conversation->participants->map(fn ($p) => ['user_id' => $p->user_id])->values()
                    : [],
            ]),
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
        ];
    }

    protected function receiptStatus(?int $viewerUserId): string
    {
        $receipts = $this->receipts;

        if ($receipts->isEmpty()) {
            return 'sent';
        }

        $settings = app(UserSettingsServiceInterface::class);

        // Reciprocity: if the viewer has turned off their own read-receipt sharing,
        // WhatsApp caps everything they see at "delivered" regardless of actual reads.
        $viewerAllowsReadReceipts = $viewerUserId === null || $settings->allowsReadReceipts($viewerUserId);

        $countsAsRead = fn ($receipt) => $receipt->read_at !== null && $settings->allowsReadReceipts($receipt->user_id);

        if ($viewerAllowsReadReceipts && $receipts->every($countsAsRead)) {
            return 'read';
        }

        if ($receipts->every(fn ($receipt) => $receipt->delivered_at !== null)) {
            return 'delivered';
        }

        return 'sent';
    }
}
