<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Enums\MessageType;
use Converse\Chat\Traits\BelongsToChatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
        'edited_at',
        'deleted_for_everyone_at',
        'expires_at',
    ];

    protected $casts = [
        'type' => MessageType::class,
        'is_forwarded' => 'boolean',
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

    public function isDeletedForEveryone(): bool
    {
        return $this->deleted_for_everyone_at !== null;
    }

    public function isSystemMessage(): bool
    {
        return $this->type === MessageType::System || $this->chatable_id === null;
    }
}
