<?php

namespace Riwaaq\Chat\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Enums\MessageType;
use Riwaaq\Chat\Traits\BelongsToChatable;

class Message extends Model
{
    use BelongsToChatable;

    protected $fillable = [
        'conversation_id',
        'chatable_id',
        'chatable_type',
        'type',
        'body',
        'reply_to_message_id',
        'forwarded_from_message_id',
        'is_forwarded',
        'metadata',
        'has_link',
        'edited_at',
        'deleted_for_everyone_at',
        'expires_at',
    ];

    protected $casts = [
        'type' => MessageType::class,
        'is_forwarded' => 'boolean',
        'has_link' => 'boolean',
        'metadata' => 'array',
        'edited_at' => 'datetime',
        'deleted_for_everyone_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function getTable(): string
    {
        return Chat::table('messages');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_message_id');
    }

    public function forwardedFrom(): BelongsTo
    {
        return $this->belongsTo(self::class, 'forwarded_from_message_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MessageAttachment::class, 'message_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(MessageReaction::class, 'message_id');
    }

    public function pollVotes(): HasMany
    {
        return $this->hasMany(PollVote::class, 'message_id');
    }

    public function eventRsvps(): HasMany
    {
        return $this->hasMany(EventRsvp::class, 'message_id');
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(MessageReceipt::class, 'message_id');
    }

    public function deletions(): HasMany
    {
        return $this->hasMany(MessageDeletion::class, 'message_id');
    }

    public function starredBy(): HasMany
    {
        return $this->hasMany(StarredMessage::class, 'message_id');
    }

    public function pinnedIn(): HasOne
    {
        return $this->hasOne(PinnedMessage::class, 'message_id');
    }

    public function edits(): HasMany
    {
        return $this->hasMany(MessageEdit::class, 'message_id');
    }

    public function isDeletedForEveryone(): bool
    {
        return $this->deleted_for_everyone_at !== null;
    }

    public function isSystemMessage(): bool
    {
        return $this->type === MessageType::System || $this->chatable_id === null;
    }

    /**
     * Any text message containing a URL counts as a "link" for the media/search 'links'
     * filter — not only ones where the composer's client-side OG-preview fetch happened to
     * finish before send (that's a best-effort race against however fast the sender hits
     * enter). Computed at write time (see MessageService::send()/update()) into the indexed
     * `has_link` column so MessageRepository::media() never needs a body LIKE scan.
     */
    public static function hasLinkInBody(?string $body): bool
    {
        return $body !== null && preg_match('/https?:\/\/\S+/', $body) === 1;
    }
}
