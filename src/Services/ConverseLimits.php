<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\ConverseLimitsInterface;
use Converse\Chat\Contracts\LimitsOverrideInterface;
use ConversePro\LimitsOverride;

/**
 * See ConverseLimitsInterface's docblock for why every gating rule goes through here.
 *
 * This class is the *only* place in the package that ever references converse-pro, and
 * only through an optional class_exists() check — the core package has zero hard
 * dependency on the add-on being installed. See the README's "Extension point" section
 * for the contract a paid add-on (or any other override) is expected to fulfil.
 */
class ConverseLimits implements ConverseLimitsInterface
{
    public function maxGroupParticipants(): ?int
    {
        $override = $this->override();

        // `??` can't be used here: null is *also* the override's legitimate "unlimited"
        // return value, not just "no override present" — using it would silently fall back
        // to the free-tier config every time an active license means unlimited.
        return $override !== null ? $override->maxGroupParticipants() : config('converse.max_group_participants');
    }

    public function historyDays(): ?int
    {
        $override = $this->override();

        return $override !== null ? $override->historyDays() : config('converse.history_days');
    }

    public function showBranding(): bool
    {
        return $this->override()?->showBranding() ?? (bool) config('converse.show_branding');
    }

    /**
     * `ConversePro\LimitsOverride` isn't a real class here — converse-pro isn't a
     * dependency of this package — but referencing its FQCN via ::class is safe: it's
     * just a compile-time string, resolved to an actual class only if class_exists()
     * (i.e. converse-pro is installed and autoloaded) says it's safe to do so.
     */
    protected function override(): ?LimitsOverrideInterface
    {
        if (! class_exists(LimitsOverride::class)) {
            return null;
        }

        return app(LimitsOverride::class);
    }
}
