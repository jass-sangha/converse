<?php

namespace Riwaaq\Chat\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Riwaaq\Chat\Chat;

class BlockedUser extends Model
{
    protected $fillable = ['blocker_id', 'blocker_type', 'blocked_id', 'blocked_type'];

    public function getTable(): string
    {
        return Chat::table('blocked_users');
    }

    public function blocker(): MorphTo
    {
        return $this->morphTo();
    }

    public function blocked(): MorphTo
    {
        return $this->morphTo();
    }
}
