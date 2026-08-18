<?php

namespace Converse\Chat\Services;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\ConversationLimitServiceInterface;
use Converse\Chat\Contracts\ConversationRepositoryInterface;
use Converse\Chat\Contracts\ConversationServiceInterface;
use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Events\ConversationCreated;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\ConversationParticipant;
use Converse\Chat\Traits\SendsSystemMessages;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ConversationService implements ConversationServiceInterface
{
    use SendsSystemMessages;

    public function __construct(
        protected ConversationRepositoryInterface $conversations,
        protected ParticipantRepositoryInterface $participants,
        protected ConversationLimitServiceInterface $limits,
    ) {}

    public function listForUser(Model $chatable, array $filters = []): Collection
    {
        return $this->conversations->getForUser($chatable, $filters);
    }

    public function find(int $id): Conversation
    {
        return $this->conversations->findById($id);
    }

    public function findOrCreatePrivate(Model $chatable, Model $other): array
    {
        $existing = $this->conversations->findPrivateBetween($chatable, $other);

        if ($existing) {
            return ['conversation' => $existing, 'created' => false];
        }

        $participants = collect([$chatable, $other]);

        $conversation = $this->conversations->create([], $participants, $chatable);

        broadcast(new ConversationCreated($conversation->id, $participants))->toOthers();

        return ['conversation' => $conversation, 'created' => true];
    }

    public function createGroup(array $data, Collection $participants, Model $creator): Conversation
    {
        $participants = $participants
            ->push($creator)
            ->unique(fn (Model $chatable) => Chat::identify($chatable))
            ->values();

        if (! $this->limits->canCreateGroupWith($participants->count())) {
            throw ValidationException::withMessages([
                'participants' => 'Group conversations are limited to '.$this->limits->maxGroupParticipants().' participants on the current plan. Upgrade to create larger groups.',
            ]);
        }

        $conversation = $this->conversations->create($data, $participants, $creator);

        $this->sendSystemMessage($conversation, 'group_created', [
            'actor_type' => $creator->getMorphClass(),
            'actor_id' => $creator->getKey(),
        ]);

        broadcast(new ConversationCreated($conversation->id, $participants))->toOthers();

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

    public function removeAvatar(Conversation $conversation): Conversation
    {
        $disk = config('chat.media.disk', 'chat');

        if ($conversation->avatar_path) {
            Storage::disk($disk)->delete($conversation->avatar_path);
        }

        return $this->conversations->update($conversation, ['avatar_path' => null]);
    }

    public function mute(Conversation $conversation, Model $chatable, ?string $mutedUntil): void
    {
        $participant = $this->participants->findFor($conversation->id, $chatable);

        abort_if($participant === null, 403);

        $participant->update(['muted_until' => $mutedUntil]);
    }

    public function muteAllOfType(Model $chatable, ?string $type, ?string $mutedUntil): void
    {
        $query = ConversationParticipant::query()
            ->where('chatable_type', $chatable->getMorphClass())
            ->where('chatable_id', $chatable->getKey())
            ->whereNull('left_at');

        if ($type !== null) {
            $query->whereHas('conversation', fn ($q) => $q->where('type', $type));
        }

        $query->update(['muted_until' => $mutedUntil]);
    }

    public function setArchived(Conversation $conversation, Model $chatable, bool $archived): void
    {
        $participant = $this->participants->findFor($conversation->id, $chatable);

        abort_if($participant === null, 403);

        $participant->update(['archived_at' => $archived ? now() : null]);
    }

    public function setPinned(Conversation $conversation, Model $chatable, bool $pinned): void
    {
        $participant = $this->participants->findFor($conversation->id, $chatable);

        abort_if($participant === null, 403);

        $participant->update(['pinned_at' => $pinned ? now() : null]);
    }

    public function setFavourited(Conversation $conversation, Model $chatable, bool $favourited): void
    {
        $participant = $this->participants->findFor($conversation->id, $chatable);

        abort_if($participant === null, 403);

        $participant->update(['favourited_at' => $favourited ? now() : null]);
    }

    public function setHidden(Conversation $conversation, Model $chatable, bool $hidden): void
    {
        $participant = $this->participants->findFor($conversation->id, $chatable);

        abort_if($participant === null, 403);

        $participant->update(['hidden_at' => $hidden ? now() : null]);
    }

    public function setManuallyUnread(Conversation $conversation, Model $chatable, bool $unread): void
    {
        $participant = $this->participants->findFor($conversation->id, $chatable);

        abort_if($participant === null, 403);

        if ($unread) {
            // Independent of last_read_message_id on purpose — this is a personal reminder flag,
            // not an actual "un-read" of anything, so it must never affect the read receipts the
            // sender sees on their own messages.
            $participant->update(['manually_unread_at' => now()]);

            return;
        }

        $latestId = $conversation->lastMessage?->id;

        $participant->update([
            'manually_unread_at' => null,
            'last_read_message_id' => $latestId !== null
                ? max($latestId, $participant->last_read_message_id ?? 0)
                : $participant->last_read_message_id,
        ]);
    }

    public function setWallpaper(Conversation $conversation, Model $chatable, ?string $wallpaper): void
    {
        $participant = $this->participants->findFor($conversation->id, $chatable);

        abort_if($participant === null, 403);

        $participant->update(['wallpaper' => $wallpaper]);
    }

    public function setDisappearingTtl(Conversation $conversation, ?int $ttlSeconds): Conversation
    {
        return $this->conversations->update($conversation, ['disappearing_messages_ttl' => $ttlSeconds]);
    }
}
