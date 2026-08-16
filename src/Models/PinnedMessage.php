<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PinnedMessage extends Model
{
    protected $fillable = ['conversation_id', 'message_id', 'pinner_id', 'pinner_type'];

    public function getTable(): string
    {
        return Chat::table('pinned_messages');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }

    public function pinner(): MorphTo
    {
        return $this->morphTo();
    }
}
