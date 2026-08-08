<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Database\Factories\ConversationFactory;
use Converse\Chat\Enums\ConversationType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'description',
        'avatar_path',
        'created_by',
        'disappearing_messages_ttl',
        'last_activity_at',
    ];

    protected $casts = [
        'type' => ConversationType::class,
        'last_activity_at' => 'datetime',
    ];

    public function getTable(): string
    {
        return Chat::table('conversations');
    }

    protected static function newFactory(): ConversationFactory
    {
        return ConversationFactory::new();
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class, 'conversation_id');
    }

    public function activeParticipants(): HasMany
    {
        return $this->participants()->whereNull('left_at');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }

    public function lastMessage(): HasOne
    {
        return $this->hasOne(Message::class, 'conversation_id')->latestOfMany();
    }

    public function isPrivate(): bool
    {
        return $this->type === ConversationType::Private;
    }

    public function isGroup(): bool
    {
        return $this->type === ConversationType::Group;
    }
}
