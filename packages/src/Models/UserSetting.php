<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Traits\BelongsToChatUser;
use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    use BelongsToChatUser;

    public $incrementing = false;

    protected $primaryKey = 'user_id';

    protected $fillable = ['user_id', 'show_last_seen', 'show_read_receipts'];

    protected $casts = [
        'show_last_seen' => 'boolean',
        'show_read_receipts' => 'boolean',
    ];

    public function getTable(): string
    {
        return Chat::table('user_settings');
    }
}
