<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Traits\BelongsToChatUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StarredMessage extends Model
{
    use BelongsToChatUser;

    protected $fillable = ['message_id', 'user_id'];

    public function getTable(): string
    {
        return Chat::table('starred_messages');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
