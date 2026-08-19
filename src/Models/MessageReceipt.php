<?php

namespace Riwaaq\Chat\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Traits\BelongsToChatable;

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
