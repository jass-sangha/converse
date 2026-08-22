<?php

namespace Riwaaq\Chat\Http\Resources;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Riwaaq\Chat\Contracts\UserSettingsServiceInterface;
use Riwaaq\Chat\Enums\MessageType;
use Riwaaq\Chat\Models\EventRsvp;
use Riwaaq\Chat\Models\MessageReaction;
use Riwaaq\Chat\Models\MessageReceipt;
use Riwaaq\Chat\Models\PollVote;
use Riwaaq\Chat\Models\StarredMessage;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewer = $request->user();

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'chatable_type' => $this->chatable_type,
            'chatable_id' => $this->chatable_id,
            'type' => $this->type?->value,
            'body' => $this->isDeletedForEveryone() ? null : $this->body,
            'is_forwarded' => $this->is_forwarded,
            'metadata' => $this->isDeletedForEveryone() ? null : $this->metadata,
            'edited_at' => $this->edited_at,
            'deleted_for_everyone' => $this->isDeletedForEveryone(),
            'reply_to' => $this->whenLoaded('replyTo', fn () => $this->replyTo ? [
                'id' => $this->replyTo->id,
                'chatable_type' => $this->replyTo->chatable_type,
                'chatable_id' => $this->replyTo->chatable_id,
                'type' => $this->replyTo->type?->value,
                'body' => str($this->replyTo->body ?? '')->limit(100)->toString(),
                'metadata' => $this->replyTo->metadata,
                'deleted_for_everyone' => $this->replyTo->isDeletedForEveryone(),
                'attachments' => $this->replyTo->relationLoaded('attachments') && ! $this->replyTo->isDeletedForEveryone()
                    ? $this->replyTo->attachments->map(fn ($attachment) => [
                        'id' => $attachment->id,
                        'url' => $attachment->url,
                        'thumbnail_url' => $attachment->thumbnail_url,
                        'mime_type' => $attachment->mime_type,
                        'original_filename' => $attachment->original_filename,
                    ])->values()
                    : [],
            ] : null),
            'attachments' => $this->whenLoaded('attachments', fn () => $this->isDeletedForEveryone() ? [] : $this->attachments->map(fn ($attachment) => [
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
                    'self' => $viewer !== null && $group->contains(fn (MessageReaction $r) => $this->isChatable($r, $viewer)),
                    'chatables' => $group->map(fn (MessageReaction $r) => ['type' => $r->chatable_type, 'id' => $r->chatable_id])->values(),
                ])
                ->values()),
            // Per-receipt delivered_at/read_at detail lives at GET /messages/{message}/receipts
            // instead, fetched on demand only when a user opens "message info" for one message —
            // not shipped for every message on every page load. See that endpoint's docblock.
            'status' => $this->resolveReceiptStatus($viewer),
            'is_starred_by_me' => $this->whenLoaded('starredBy', fn () => $viewer !== null
                && $this->starredBy->contains(fn (StarredMessage $s) => $this->isChatable($s, $viewer))),
            'is_pinned' => $this->whenLoaded('pinnedIn', fn () => $this->pinnedIn !== null, false),
            'poll' => $this->whenLoaded('pollVotes', fn () => $this->type === MessageType::Poll ? $this->pollTally($viewer) : null),
            'event' => $this->whenLoaded('eventRsvps', fn () => $this->type === MessageType::Event ? $this->eventTally($viewer) : null),
            'conversation' => $this->whenLoaded('conversation', fn () => [
                'id' => $this->conversation->id,
                'name' => $this->conversation->name,
                'type' => $this->conversation->type?->value,
                // Field names must match ParticipantResource's shape (chatable_type/chatable_id),
                // not a short type/id pair, since every frontend consumer keys off chatableKeyOf()
                // which reads those exact names — a mismatch silently produces an
                // "undefined:undefined" chatable key that then 422s on /users.
                'participants' => $this->conversation->relationLoaded('participants')
                    ? $this->conversation->participants->map(fn ($p) => ['chatable_type' => $p->chatable_type, 'chatable_id' => $p->chatable_id])->values()
                    : [],
            ]),
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
        ];
    }

    protected function isChatable(mixed $row, Model $chatable): bool
    {
        return $row->chatable_type === $chatable->getMorphClass() && $row->chatable_id === $chatable->getKey();
    }

    protected function pollTally(?Model $viewer): array
    {
        $optionCount = count($this->metadata['options'] ?? []);

        $options = collect(range(0, max($optionCount - 1, -1)))->map(function (int $index) use ($viewer) {
            $group = $this->pollVotes->where('option_index', $index);

            return [
                'index' => $index,
                'count' => $group->count(),
                'self' => $viewer !== null && $group->contains(fn (PollVote $v) => $this->isChatable($v, $viewer)),
                'voters' => $group->map(fn (PollVote $v) => ['type' => $v->chatable_type, 'id' => $v->chatable_id])->values(),
            ];
        })->values();

        return [
            'options' => $options,
            'total_voters' => $this->pollVotes->unique(fn (PollVote $v) => $v->chatable_type.':'.$v->chatable_id)->count(),
        ];
    }

    protected function eventTally(?Model $viewer): array
    {
        $myStatus = $viewer === null ? null : optional(
            $this->eventRsvps->first(fn (EventRsvp $r) => $this->isChatable($r, $viewer))
        )->status;

        return collect(['going', 'maybe', 'declined'])->mapWithKeys(function (string $status) {
            $group = $this->eventRsvps->where('status', $status);

            return [$status => [
                'count' => $group->count(),
                'respondents' => $group->map(fn (EventRsvp $r) => ['type' => $r->chatable_type, 'id' => $r->chatable_id])->values(),
            ]];
        })->put('my_status', $myStatus)->toArray();
    }

    /**
     * Prefers the batched receipt_summary counts (see MessageRepository::receiptSummariesFor())
     * set on the model as a virtual attribute — same pattern as unread_count on conversations —
     * over loading the full receipts relation, which the timeline/search/conversation-list
     * endpoints no longer eager-load for exactly this reason. Falls back to the row-based
     * whenLoaded('receipts') path for the single-message responses (store/update/forward, and
     * this resource's other consumers) that still eager-load the relation directly.
     */
    protected function resolveReceiptStatus(?Model $viewer): mixed
    {
        if (isset($this->receipt_summary)) {
            return $this->receiptStatusFromSummary($this->receipt_summary, $viewer);
        }

        return $this->whenLoaded('receipts', fn () => $this->receiptStatus($viewer));
    }

    /**
     * @param  array{recipient_count: int, delivered_count: int, read_count: int}  $summary
     */
    protected function receiptStatusFromSummary(array $summary, ?Model $viewer): string
    {
        if ($summary['recipient_count'] === 0) {
            return 'sent';
        }

        $settings = app(UserSettingsServiceInterface::class);

        // Reciprocity: if the viewer has turned off their own read-receipt sharing,
        // WhatsApp caps everything they see at "delivered" regardless of actual reads.
        $viewerAllowsReadReceipts = $viewer === null || $settings->allowsReadReceipts($viewer);

        if ($viewerAllowsReadReceipts && $summary['read_count'] === $summary['recipient_count']) {
            return 'read';
        }

        if ($summary['delivered_count'] === $summary['recipient_count']) {
            return 'delivered';
        }

        return 'sent';
    }

    protected function receiptStatus(?Model $viewer): string
    {
        $receipts = $this->receipts;

        if ($receipts->isEmpty()) {
            return 'sent';
        }

        $settings = app(UserSettingsServiceInterface::class);

        // Reciprocity: if the viewer has turned off their own read-receipt sharing,
        // WhatsApp caps everything they see at "delivered" regardless of actual reads.
        $viewerAllowsReadReceipts = $viewer === null || $settings->allowsReadReceipts($viewer);

        $countsAsRead = fn (MessageReceipt $receipt) => $receipt->read_at !== null
            && $receipt->chatable !== null
            && $settings->allowsReadReceipts($receipt->chatable);

        if ($viewerAllowsReadReceipts && $receipts->every($countsAsRead)) {
            return 'read';
        }

        if ($receipts->every(fn (MessageReceipt $receipt) => $receipt->delivered_at !== null)) {
            return 'delivered';
        }

        return 'sent';
    }
}
