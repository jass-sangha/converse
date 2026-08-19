<?php

namespace Riwaaq\Chat\Services;

use Riwaaq\Chat\Contracts\RiwaaqLimitsInterface;
use Riwaaq\Chat\Contracts\LimitsOverrideInterface;
use RiwaaqPro\LimitsOverride;

/**
 * See RiwaaqLimitsInterface's docblock for why every gating rule goes through here.
 *
 * This class is the *only* place in the package that ever references riwaaq-pro, and
 * only through an optional class_exists() check — the core package has zero hard
 * dependency on the add-on being installed. See the README's "Extension point" section
 * for the contract a paid add-on (or any other override) is expected to fulfil.
 */
class RiwaaqLimits implements RiwaaqLimitsInterface
{
    public function maxGroupParticipants(): ?int
    {
        $override = $this->override();

        // `??` can't be used here: null is *also* the override's legitimate "unlimited"
        // return value, not just "no override present" — using it would silently fall back
        // to the free-tier config every time an active license means unlimited.
        return $override !== null ? $override->maxGroupParticipants() : config('riwaaq.max_group_participants');
    }

    public function historyDays(): ?int
    {
        $override = $this->override();

        return $override !== null ? $override->historyDays() : config('riwaaq.history_days');
    }

    public function showBranding(): bool
    {
        return $this->override()?->showBranding() ?? (bool) config('riwaaq.show_branding');
    }

    /**
     * `RiwaaqPro\LimitsOverride` isn't a real class here — riwaaq-pro isn't a
     * dependency of this package — but referencing its FQCN via ::class is safe: it's
     * just a compile-time string, resolved to an actual class only if class_exists()
     * (i.e. riwaaq-pro is installed and autoloaded) says it's safe to do so.
     */
    protected function override(): ?LimitsOverrideInterface
    {
        if (! class_exists(LimitsOverride::class)) {
            return null;
        }

        return app(LimitsOverride::class);
    }
}
