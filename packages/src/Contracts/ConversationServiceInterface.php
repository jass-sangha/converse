<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

interface ConversationServiceInterface
{
    public function listForUser(int $userId, array $filters = []): Collection;

    public function find(int $id): Conversation;

    public function findOrCreatePrivate(int $userId, int $otherUserId): array;

    public function createGroup(array $data, array $participantUserIds, int $creatorId): Conversation;

    public function update(Conversation $conversation, array $data): Conversation;

    public function updateAvatar(Conversation $conversation, UploadedFile $avatar): Conversation;

    public function mute(Conversation $conversation, int $userId, ?string $mutedUntil): void;

    public function setArchived(Conversation $conversation, int $userId, bool $archived): void;

    public function setPinned(Conversation $conversation, int $userId, bool $pinned): void;

    public function setHidden(Conversation $conversation, int $userId, bool $hidden): void;

    public function setWallpaper(Conversation $conversation, int $userId, ?string $wallpaper): void;

    public function setDisappearingTtl(Conversation $conversation, ?int $ttlSeconds): Conversation;
}
