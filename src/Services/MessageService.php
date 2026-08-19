<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\AttachmentServiceInterface;
use Riwaaq\Chat\Contracts\BlockedUserServiceInterface;
use Riwaaq\Chat\Contracts\ConversationRepositoryInterface;
use Riwaaq\Chat\Contracts\MessageRepositoryInterface;
use Riwaaq\Chat\Contracts\MessageServiceInterface;
use Riwaaq\Chat\Contracts\ParticipantRepositoryInterface;
use Riwaaq\Chat\Enums\MessageType;
use Riwaaq\Chat\Events\MessageDeleted;
use Riwaaq\Chat\Events\MessageSent;
use Riwaaq\Chat\Events\MessageUpdated;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Models\MessageAttachment;
use Riwaaq\Chat\Models\MessageDeletion;
use Riwaaq\Chat\Models\MessageEdit;
use Riwaaq\Chat\Models\MessageReceipt;
use Riwaaq\Chat\Notifications\NewChatMessageNotification;

class MessageService implements MessageServiceInterface
{
    public function __construct(
        protected MessageRepositoryInterface $messages,
        protected ParticipantRepositoryInterface $participants,
        protected ConversationRepositoryInterface $conversations,
        protected BlockedUserServiceInterface $blockedUsers,
        protected AttachmentServiceInterface $attachments,
    ) {}

    public function send(Conversation $conversation, Model $chatable, array $data): Message
    {
        $this->guardAgainstBlockedPrivateSend($conversation, $chatable);

        return DB::transaction(function () use ($conversation, $chatable, $data) {
            $message = $this->messages->create([
                'conversation_id' => $conversation->id,
                'chatable_type' => $chatable->getMorphClass(),
                'chatable_id' => $chatable->getKey(),
                'type' => $data['type'] ?? MessageType::Text->value,
                'body' => $data['body'] ?? null,
                'reply_to_message_id' => $data['reply_to_message_id'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'expires_at' => $this->resolveExpiry($conversation),
            ]);

            if (! empty($data['attachment_ids'])) {
                $this->attachments->attachToMessage($data['attachment_ids'], $message, $chatable);
            }

            $others = $this->otherActiveChatables($conversation, $chatable);

            $this->createReceiptsForOthers($message, $others);

            $conversation->forceFill(['last_activity_at' => now()])->save();

            broadcast(new MessageSent($message))->toOthers();

            $this->notifyOthers($message, $others);

            return $message;
        });
    }

    public function listForConversation(
        Conversation $conversation,
        Model $chatable,
        int $perPage,
        ?int $beforeId = null
    ): LengthAwarePaginator {
        return $this->messages->paginateForConversation($conversation, $chatable, $perPage, $beforeId);
    }

    public function find(int $id): Message
    {
        return $this->messages->findById($id);
    }

    public function search(Model $chatable, string $query, ?int $conversationId, int $perPage): LengthAwarePaginator
    {
        return $this->messages->search($chatable, $query, $conversationId, $perPage);
    }

    public function update(Message $message, string $body): Message
    {
        // Snapshot what it said *before* this edit overwrites it — a plain "edited_at" timestamp
        // alone has nothing to show if someone wants to see the earlier version.
        MessageEdit::query()->create([
            'message_id' => $message->id,
            'previous_body' => $message->body,
            'edited_at' => now(),
        ]);

        $message->update([
            'body' => $body,
            'edited_at' => now(),
        ]);

        broadcast(new MessageUpdated($message))->toOthers();

        return $message;
    }

    public function deleteForEveryone(Message $message): void
    {
        $message->update([
            'deleted_for_everyone_at' => now(),
            'body' => null,
            'metadata' => null,
        ]);

        broadcast(new MessageDeleted($message->id, $message->conversation_id))->toOthers();
    }

    public function deleteForMe(Message $message, Model $chatable): void
    {
        MessageDeletion::query()->updateOrCreate(
            ['message_id' => $message->id, 'chatable_type' => $chatable->getMorphClass(), 'chatable_id' => $chatable->getKey()],
            ['deleted_at' => now()],
        );
    }

    public function clearForChatable(Conversation $conversation, Model $chatable): void
    {
        $this->messages->clearForChatable($conversation, $chatable);
    }

    public function media(Model $chatable, string $kind, ?int $conversationId, int $perPage, ?string $search = null): LengthAwarePaginator
    {
        return $this->messages->media($chatable, $kind, $conversationId, $perPage, $search);
    }

    public function forward(Message $message, array $conversationIds, Model $chatable): array
    {
        if ($message->isDeletedForEveryone()) {
            abort(422, 'Cannot forward a deleted message.');
        }

        return DB::transaction(function () use ($message, $conversationIds, $chatable) {
            $forwarded = [];

            foreach (array_unique($conversationIds) as $conversationId) {
                $conversation = $this->conversations->findById($conversationId);

                abort_unless(
                    $this->participants->isActiveParticipant($conversationId, $chatable),
                    403
                );

                $forwarded[] = $this->send($conversation, $chatable, [
                    'type' => $message->type->value,
                    'body' => $message->body,
                    'metadata' => $message->metadata,
                ]);

                $forwardedMessage = $forwarded[array_key_last($forwarded)];

                $forwardedMessage->update([
                    'is_forwarded' => true,
                    'forwarded_from_message_id' => $message->id,
                ]);

                $this->copyAttachments($message, $forwardedMessage, $chatable);
            }

            return $forwarded;
        });
    }

    /**
     * send() only links attachments the forwarder has just uploaded (attachment_ids), so a
     * forwarded media message would otherwise carry over its type/body/metadata but none of
     * the original attachment rows — the attachments still belong to the source message and
     * can't be re-linked to a second one. Clone the rows instead, pointing at the same
     * underlying file on disk, owned by the forwarder.
     */
    protected function copyAttachments(Message $source, Message $target, Model $chatable): void
    {
        foreach ($source->attachments as $attachment) {
            MessageAttachment::query()->create([
                'message_id' => $target->id,
                'uploader_type' => $chatable->getMorphClass(),
                'uploader_id' => $chatable->getKey(),
                'disk' => $attachment->disk,
                'path' => $attachment->path,
                'original_filename' => $attachment->original_filename,
                'mime_type' => $attachment->mime_type,
                'size_bytes' => $attachment->size_bytes,
                'width' => $attachment->width,
                'height' => $attachment->height,
                'duration_seconds' => $attachment->duration_seconds,
                'thumbnail_path' => $attachment->thumbnail_path,
            ]);
        }
    }

    /**
     * @return Collection<int, Model>
     */
    protected function otherActiveChatables(Conversation $conversation, Model $sender): Collection
    {
        $senderIdentity = Chat::identify($sender);

        return $this->participants->activeChatables($conversation->id)
            ->reject(fn (Model $chatable) => Chat::identify($chatable) === $senderIdentity)
            ->values();
    }

    /**
     * @param  Collection<int, Model>  $others
     */
    protected function createReceiptsForOthers(Message $message, Collection $others): void
    {
        if ($others->isEmpty()) {
            return;
        }

        MessageReceipt::query()->insert($others->map(fn (Model $chatable) => [
            'message_id' => $message->id,
            'chatable_type' => $chatable->getMorphClass(),
            'chatable_id' => $chatable->getKey(),
            'delivered_at' => null,
            'read_at' => null,
        ])->all());
    }

    /**
     * @param  Collection<int, Model>  $others
     */
    protected function notifyOthers(Message $message, Collection $others): void
    {
        if ($others->isEmpty()) {
            return;
        }

        Notification::send($others, new NewChatMessageNotification($message));
    }

    protected function guardAgainstBlockedPrivateSend(Conversation $conversation, Model $chatable): void
    {
        if (! $conversation->isPrivate()) {
            return;
        }

        $other = $this->otherActiveChatables($conversation, $chatable)->first();

        if ($other === null) {
            return;
        }

        abort_if(
            $this->blockedUsers->isBlockedEitherWay($chatable, $other),
            403,
            'You cannot message this user.'
        );
    }

    protected function resolveExpiry(Conversation $conversation): ?string
    {
        if (! config('chat.disappearing_messages.enabled') || ! $conversation->disappearing_messages_ttl) {
            return null;
        }

        return now()->addSeconds($conversation->disappearing_messages_ttl);
    }
}
