<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Enums\Plan;
use Converse\Chat\Models\License;

/**
 * The single source of truth for "what plan is this install on, and what does that plan
 * allow" — every other gating rule (group size, message history, branding) reads through
 * here instead of resolving the license row or config/converse.php itself, so a pricing
 * change or a real license-server integration only ever touches this one implementation.
 */
interface LicenseServiceInterface
{
    public function current(): License;

    public function isValid(): bool;

    /**
     * The effective plan for gating purposes. An expired paid license degrades to Free
     * rather than erroring — gating stays informational, never a hard failure.
     */
    public function plan(): Plan;

    public function maxGroupParticipants(): ?int;

    public function historyDays(): ?int;

    public function showBranding(): bool;
}
