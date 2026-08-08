<?php

namespace Converse\Chat\Services;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\AttachmentServiceInterface;
use Converse\Chat\Contracts\BlockedUserServiceInterface;
use Converse\Chat\Contracts\ConversationRepositoryInterface;
use Converse\Chat\Contracts\MessageRepositoryInterface;
use Converse\Chat\Contracts\MessageServiceInterface;
use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Enums\MessageType;
use Converse\Chat\Events\MessageDeleted;
use Converse\Chat\Events\MessageSent;
use Converse\Chat\Events\MessageUpdated;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Converse\Chat\Models\MessageDeletion;
use Converse\Chat\Models\MessageReceipt;
use Converse\Chat\Notifications\NewChatMessageNotification;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class MessageService implements MessageServiceInterface
{
    public function __construct(
        protected MessageRepositoryInterface $messages,
        protected ParticipantRepositoryInterface $participants,
        protected ConversationRepositoryInterface $conversations,
        protected BlockedUserServiceInterface $blockedUsers,
        protected AttachmentServiceInterface $attachments,
    ) {}

    public function send(Conversation $conversation, int $userId, array $data): Message
    {
        $this->guardAgainstBlockedPrivateSend($conversation, $userId);

        return DB::transaction(function () use ($conversation, $userId, $data) {
            $message = $this->messages->create([
                'conversation_id' => $conversation->id,
                'user_id' => $userId,
                'type' => $data['type'] ?? MessageType::Text->value,
                'body' => $data['body'] ?? null,
                'reply_to_message_id' => $data['reply_to_message_id'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'expires_at' => $this->resolveExpiry($conversation),
            ]);

            if (! empty($data['attachment_ids'])) {
                $this->attachments->attachToMessage($data['attachment_ids'], $message, $userId);
            }

            $this->createReceiptsForOthers($message, $conversation, $userId);

            $conversation->forceFill(['last_activity_at' => now()])->save();

            broadcast(new MessageSent($message))->toOthers();

            $this->notifyOthers($message, $conversation, $userId);

            return $message;
        });
    }

    public function listForConversation(
        Conversation $conversation,
        int $userId,
        int $perPage,
        ?int $beforeId = null
    ): LengthAwarePaginator {
        return $this->messages->paginateForConversation($conversation, $userId, $perPage, $beforeId);
    }

    public function find(int $id): Message
    {
        return $this->messages->findById($id);
    }

    public function search(int $userId, string $query, ?int $conversationId, int $perPage): LengthAwarePaginator
    {
        return $this->messages->search($userId, $query, $conversationId, $perPage);
    }

    public function update(Message $message, string $body): Message
    {
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

    public function deleteForMe(Message $message, int $userId): void
    {
        MessageDeletion::query()->updateOrCreate(
            ['message_id' => $message->id, 'user_id' => $userId],
            ['deleted_at' => now()],
        );
    }

    public function forward(Message $message, array $conversationIds, int $userId): array
    {
        if ($message->isDeletedForEveryone()) {
            abort(422, 'Cannot forward a deleted message.');
        }

        return DB::transaction(function () use ($message, $conversationIds, $userId) {
            $forwarded = [];

            foreach (array_unique($conversationIds) as $conversationId) {
                $conversation = $this->conversations->findById($conversationId);

                abort_unless(
                    $this->participants->isActiveParticipant($conversationId, $userId),
                    403
                );

                $forwarded[] = $this->send($conversation, $userId, [
                    'type' => $message->type->value,
                    'body' => $message->body,
                    'metadata' => $message->metadata,
                ]);

                $forwarded[array_key_last($forwarded)]->update([
                    'is_forwarded' => true,
                    'forwarded_from_message_id' => $message->id,
                ]);
            }

            return $forwarded;
        });
    }

    protected function createReceiptsForOthers(Message $message, Conversation $conversation, int $senderId): void
    {
        $otherUserIds = array_values(array_diff(
            $this->participants->activeUserIds($conversation->id),
            [$senderId]
        ));

        if (empty($otherUserIds)) {
            return;
        }

        MessageReceipt::query()->insert(array_map(fn (int $userId) => [
            'message_id' => $message->id,
            'user_id' => $userId,
            'delivered_at' => null,
            'read_at' => null,
        ], $otherUserIds));
    }

    protected function notifyOthers(Message $message, Conversation $conversation, int $senderId): void
    {
        $otherUserIds = array_values(array_diff(
            $this->participants->activeUserIds($conversation->id),
            [$senderId]
        ));

        if (empty($otherUserIds)) {
            return;
        }

        $notifiables = Chat::userModel()::query()->whereIn('id', $otherUserIds)->get();

        Notification::send($notifiables, new NewChatMessageNotification($message));
    }

    protected function guardAgainstBlockedPrivateSend(Conversation $conversation, int $userId): void
    {
        if (! $conversation->isPrivate()) {
            return;
        }

        $otherUserId = collect($this->participants->activeUserIds($conversation->id))
            ->first(fn (int $id) => $id !== $userId);

        if ($otherUserId === null) {
            return;
        }

        abort_if(
            $this->blockedUsers->isBlockedEitherWay($userId, $otherUserId),
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
