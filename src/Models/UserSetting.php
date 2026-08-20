<?php

namespace Riwaaq\Chat\Models;

use Illuminate\Database\Eloquent\Model;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Traits\BelongsToChatable;

class UserSetting extends Model
{
    use BelongsToChatable;

    protected $fillable = [
        'chatable_id',
        'chatable_type',
        'show_last_seen',
        'show_read_receipts',
        'show_typing_indicator',
        'last_seen_hidden_until',
        'read_receipts_hidden_until',
        'typing_indicator_hidden_until',
        'avatar_path',
        'about',
    ];

    protected $casts = [
        'show_last_seen' => 'boolean',
        'show_read_receipts' => 'boolean',
        'show_typing_indicator' => 'boolean',
        'last_seen_hidden_until' => 'datetime',
        'read_receipts_hidden_until' => 'datetime',
        'typing_indicator_hidden_until' => 'datetime',
    ];

    /**
     * Whichever of `show_last_seen` or `last_seen_hidden_until` currently governs visibility:
     * a future hidden-until timestamp forces it off regardless of the flag; once that lapses
     * (or was never set), the flag alone decides — mirrors ConversationParticipant's muted_until.
     */
    public function lastSeenVisible(): bool
    {
        if ($this->last_seen_hidden_until !== null && $this->last_seen_hidden_until->isFuture()) {
            return false;
        }

        return $this->show_last_seen;
    }

    public function readReceiptsVisible(): bool
    {
        if ($this->read_receipts_hidden_until !== null && $this->read_receipts_hidden_until->isFuture()) {
            return false;
        }

        return $this->show_read_receipts;
    }

    public function typingIndicatorVisible(): bool
    {
        if ($this->typing_indicator_hidden_until !== null && $this->typing_indicator_hidden_until->isFuture()) {
            return false;
        }

        return $this->show_typing_indicator;
    }

    public function getTable(): string
    {
        return Chat::table('user_settings');
    }
}
