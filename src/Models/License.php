<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Converse\Chat\Enums\Plan;
use Illuminate\Database\Eloquent\Model;

/**
 * A single row for the whole install — this package has no multi-tenancy, so there is
 * exactly one license/plan active at a time. See LicenseServiceInterface for the
 * get-or-create accessor; nothing should query this model directly outside of it.
 */
class License extends Model
{
    protected $fillable = [
        'plan',
        'license_key',
        'expires_at',
    ];

    protected $casts = [
        'plan' => Plan::class,
        'expires_at' => 'datetime',
    ];

    public function getTable(): string
    {
        return Chat::table('license');
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Stub until the central license server exists (see class docblock on
     * LicenseServiceInterface) — a paid plan is valid as long as it hasn't expired; free
     * never expires since there's nothing to verify against a server for it. Swap the
     * paid branch for a real license-key verification call once that server exists.
     */
    public function isValid(): bool
    {
        if ($this->plan === Plan::Free) {
            return true;
        }

        return ! $this->isExpired();
    }
}
