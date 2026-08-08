<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\ConversationRepositoryInterface;
use Converse\Chat\Contracts\ConversationServiceInterface;
use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Events\ConversationCreated;
use Converse\Chat\Models\Conversation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class ConversationService implements ConversationServiceInterface
{
    public function __construct(
        protected ConversationRepositoryInterface $conversations,
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function listForUser(int $userId, array $filters = []): Collection
    {
        return $this->conversations->getForUser($userId, $filters);
    }

    public function find(int $id): Conversation
    {
        return $this->conversations->findById($id);
    }

    public function findOrCreatePrivate(int $userId, int $otherUserId): array
    {
        $existing = $this->conversations->findPrivateBetween($userId, $otherUserId);

        if ($existing) {
            return ['conversation' => $existing, 'created' => false];
        }

        $conversation = $this->conversations->create([], [$userId, $otherUserId], $userId);

        broadcast(new ConversationCreated($conversation->id, [$userId, $otherUserId]))->toOthers();

        return ['conversation' => $conversation, 'created' => true];
    }

    public function createGroup(array $data, array $participantUserIds, int $creatorId): Conversation
    {
        $participantUserIds = array_values(array_unique([...$participantUserIds, $creatorId]));

        $conversation = $this->conversations->create($data, $participantUserIds, $creatorId);

        broadcast(new ConversationCreated($conversation->id, $participantUserIds))->toOthers();

        return $conversation;
    }

    public function update(Conversation $conversation, array $data): Conversation
    {
        return $this->conversations->update($conversation, $data);
    }

    public function updateAvatar(Conversation $conversation, UploadedFile $avatar): Conversation
    {
        $disk = config('chat.media.disk', 'chat');

        if ($conversation->avatar_path) {
            Storage::disk($disk)->delete($conversation->avatar_path);
        }

        $path = $avatar->store('conversation-avatars', $disk);

        return $this->conversations->update($conversation, ['avatar_path' => $path]);
    }

    public function mute(Conversation $conversation, int $userId, ?string $mutedUntil): void
    {
        $participant = $this->participants->findForUser($conversation->id, $userId);

        abort_if($participant === null, 403);

        $participant->update(['muted_until' => $mutedUntil]);
    }

    public function setArchived(Conversation $conversation, int $userId, bool $archived): void
    {
        $participant = $this->participants->findForUser($conversation->id, $userId);

        abort_if($participant === null, 403);

        $participant->update(['archived_at' => $archived ? now() : null]);
    }

    public function setPinned(Conversation $conversation, int $userId, bool $pinned): void
    {
        $participant = $this->participants->findForUser($conversation->id, $userId);

        abort_if($participant === null, 403);

        $participant->update(['pinned_at' => $pinned ? now() : null]);
    }

    public function setHidden(Conversation $conversation, int $userId, bool $hidden): void
    {
        $participant = $this->participants->findForUser($conversation->id, $userId);

        abort_if($participant === null, 403);

        $participant->update(['hidden_at' => $hidden ? now() : null]);
    }

    public function setWallpaper(Conversation $conversation, int $userId, ?string $wallpaper): void
    {
        $participant = $this->participants->findForUser($conversation->id, $userId);

        abort_if($participant === null, 403);

        $participant->update(['wallpaper' => $wallpaper]);
    }

    public function setDisappearingTtl(Conversation $conversation, ?int $ttlSeconds): Conversation
    {
        return $this->conversations->update($conversation, ['disappearing_messages_ttl' => $ttlSeconds]);
    }
}
