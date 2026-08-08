<?php

namespace Converse\Chat\Traits;

use Converse\Chat\Chat;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToChatUser
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(Chat::userModel(), 'user_id');
    }
}
