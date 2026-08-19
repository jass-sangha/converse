<?php

namespace Riwaaq\Chat\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Riwaaq\Chat\Chat;

class MessageEdit extends Model
{
    protected $fillable = ['message_id', 'previous_body', 'edited_at'];

    protected $casts = [
        'edited_at' => 'datetime',
    ];

    public function getTable(): string
    {
        return Chat::table('message_edits');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
