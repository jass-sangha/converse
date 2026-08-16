<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Traits\BelongsToChatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageReceipt extends Model
{
    use BelongsToChatable;

    public $timestamps = false;

    protected $fillable = ['message_id', 'chatable_id', 'chatable_type', 'delivered_at', 'read_at'];

    protected $casts = [
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function getTable(): string
    {
        return Chat::table('message_receipts');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
