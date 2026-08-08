<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlockedUser extends Model
{
    protected $fillable = ['blocker_id', 'blocked_id'];

    public function getTable(): string
    {
        return Chat::table('blocked_users');
    }

    public function blocker(): BelongsTo
    {
        return $this->belongsTo(Chat::userModel(), 'blocker_id');
    }

    public function blocked(): BelongsTo
    {
        return $this->belongsTo(Chat::userModel(), 'blocked_id');
    }
}
