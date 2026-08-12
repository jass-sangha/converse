<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Enums\ParticipantRole;
use Converse\Chat\Traits\BelongsToChatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationParticipant extends Model
{
    use BelongsToChatable;

    protected $fillable = [
        'conversation_id',
        'chatable_id',
        'chatable_type',
        'role',
        'joined_at',
        'left_at',
        'muted_until',
        'archived_at',
        'pinned_at',
        'favourited_at',
        'hidden_at',
        'wallpaper',
        'last_read_message_id',
    ];

    protected $casts = [
        'role' => ParticipantRole::class,
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
        'muted_until' => 'datetime',
        'archived_at' => 'datetime',
        'pinned_at' => 'datetime',
        'favourited_at' => 'datetime',
        'hidden_at' => 'datetime',
    ];

    public function getTable(): string
    {
        return Chat::table('conversation_participants');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === ParticipantRole::Admin;
    }

    public function isMuted(): bool
    {
        return $this->muted_until !== null && $this->muted_until->isFuture();
    }

    public function hasLeft(): bool
    {
        return $this->left_at !== null;
    }

    public function isHidden(): bool
    {
        return $this->hidden_at !== null;
    }
}
