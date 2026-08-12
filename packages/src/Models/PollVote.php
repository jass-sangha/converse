<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Traits\BelongsToChatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PollVote extends Model
{
    use BelongsToChatable;

    protected $fillable = ['message_id', 'chatable_id', 'chatable_type', 'option_index'];

    protected $casts = [
        'option_index' => 'integer',
    ];

    public function getTable(): string
    {
        return Chat::table('poll_votes');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
