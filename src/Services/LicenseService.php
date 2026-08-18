<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\LicenseServiceInterface;
use Converse\Chat\Enums\Plan;
use Converse\Chat\Models\License;

class LicenseService implements LicenseServiceInterface
{
    public function current(): License
    {
        // There's normally exactly one row for the whole install, created with a safe
        // free-plan default the first time anything asks for it. Resolving the *newest* row
        // (rather than firstOrCreate's "the first one") means a future license-activation flow
        // that inserts a fresh row instead of updating in place still takes effect immediately.
        return License::query()->latest('id')->first()
            ?? License::query()->create(['plan' => Plan::Free->value]);
    }

    public function isValid(): bool
    {
        return $this->current()->isValid();
    }

    public function plan(): Plan
    {
        $license = $this->current();

        return $license->isValid() ? $license->plan : Plan::Free;
    }

    public function maxGroupParticipants(): ?int
    {
        return $this->limit('max_group_participants');
    }

    public function historyDays(): ?int
    {
        return $this->limit('history_days');
    }

    public function showBranding(): bool
    {
        return (bool) $this->limit('show_branding');
    }

    protected function limit(string $key): mixed
    {
        return config("converse.plans.{$this->plan()->value}.{$key}");
    }
}
