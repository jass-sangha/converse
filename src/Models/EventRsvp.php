<?php

namespace Riwaaq\Chat\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Traits\BelongsToChatable;

class EventRsvp extends Model
{
    use BelongsToChatable;

    protected $fillable = ['message_id', 'chatable_id', 'chatable_type', 'status'];

    public function getTable(): string
    {
        return Chat::table('event_rsvps');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
