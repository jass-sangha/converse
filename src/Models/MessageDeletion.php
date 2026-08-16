<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Traits\BelongsToChatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageDeletion extends Model
{
    use BelongsToChatable;

    public $timestamps = false;

    protected $fillable = ['message_id', 'chatable_id', 'chatable_type', 'deleted_at'];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function getTable(): string
    {
        return Chat::table('message_deletions');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
