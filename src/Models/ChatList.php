<?php

namespace Riwaaq\Chat\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Traits\BelongsToChatable;

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
