<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Traits\BelongsToChatable;
use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    use BelongsToChatable;

    protected $fillable = ['chatable_id', 'chatable_type', 'show_last_seen', 'show_read_receipts', 'avatar_path', 'about'];

    protected $casts = [
        'show_last_seen' => 'boolean',
        'show_read_receipts' => 'boolean',
    ];

    public function getTable(): string
    {
        return Chat::table('user_settings');
    }
}
