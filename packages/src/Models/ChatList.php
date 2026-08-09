<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Traits\BelongsToChatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ChatList extends Model
{
    use BelongsToChatable;

    protected $fillable = ['chatable_id', 'chatable_type', 'name'];

    public function getTable(): string
    {
        return Chat::table('lists');
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(
            Conversation::class,
            Chat::table('list_conversations'),
            'list_id',
            'conversation_id',
        )->withTimestamps();
    }
}
