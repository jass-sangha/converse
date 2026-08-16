<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Traits\BelongsToChatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageReaction extends Model
{
    use BelongsToChatable;

    protected $fillable = ['message_id', 'chatable_id', 'chatable_type', 'emoji'];

    public function getTable(): string
    {
        return Chat::table('message_reactions');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
