<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Conversation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

interface ConversationServiceInterface
{
    public function listForUser(Model $chatable, array $filters = []): Collection;

    public function find(int $id): Conversation;

    public function findOrCreatePrivate(Model $chatable, Model $other): array;

    /**
     * @param  Collection<int, Model>  $participants
     */
    public function createGroup(array $data, Collection $participants, Model $creator): Conversation;

    public function update(Conversation $conversation, array $data): Conversation;

    public function updateAvatar(Conversation $conversation, UploadedFile $avatar): Conversation;

    public function removeAvatar(Conversation $conversation): Conversation;

    public function mute(Conversation $conversation, Model $chatable, ?string $mutedUntil): void;

    /**
     * Bulk-mute (or unmute, when $mutedUntil is null) every conversation the chatable
     * belongs to, optionally scoped to one conversation type. $type is a ConversationType
     * value ('private'|'group'), or null to affect both.
     */
    public function muteAllOfType(Model $chatable, ?string $type, ?string $mutedUntil): void;

    public function setArchived(Conversation $conversation, Model $chatable, bool $archived): void;

    public function setPinned(Conversation $conversation, Model $chatable, bool $pinned): void;

    public function setFavourited(Conversation $conversation, Model $chatable, bool $favourited): void;

    public function setHidden(Conversation $conversation, Model $chatable, bool $hidden): void;

    public function setManuallyUnread(Conversation $conversation, Model $chatable, bool $unread): void;

    public function setWallpaper(Conversation $conversation, Model $chatable, ?string $wallpaper): void;

    public function setDisappearingTtl(Conversation $conversation, ?int $ttlSeconds): Conversation;
}
