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
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
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

    public function media(Model $chatable, string $kind, ?int $conversationId, int $perPage): LengthAwarePaginator
    {
        return $this->messages->media($chatable, $kind, $conversationId, $perPage);
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

                $forwarded[array_key_last($forwarded)]->update([
                    'is_forwarded' => true,
                    'forwarded_from_message_id' => $message->id,
                ]);
            }

            return $forwarded;
        });
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
