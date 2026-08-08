<?php

namespace Converse\Chat\Traits;

use Illuminate\Database\Eloquent\Relations\MorphTo;

trait BelongsToChatable
{
    public function chatable(): MorphTo
    {
        return $this->morphTo();
    }
}
