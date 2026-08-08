<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Traits\BelongsToChatUser;
use Illuminate\Database\Eloquent\Model;

class UserPresence extends Model
{
    use BelongsToChatUser;

    public $incrementing = false;

    protected $primaryKey = 'user_id';

    protected $fillable = ['user_id', 'last_seen_at', 'is_online'];

    protected $casts = [
        'last_seen_at' => 'datetime',
        'is_online' => 'boolean',
    ];

    public function getTable(): string
    {
        return Chat::table('user_presence');
    }
}
