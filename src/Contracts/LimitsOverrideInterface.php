<?php

namespace Riwaaq\Chat\Contracts;

/**
 * The stable contract between this package and the paid `riwaaq-pro` add-on. If
 * `riwaaq-pro` is installed, it binds a class named exactly `RiwaaqPro\LimitsOverride`
 * implementing this interface — see RiwaaqLimits for the class_exists() hook that looks
 * for it. This is the *entire* surface paid features are allowed to override; every future
 * paid feature's limit belongs here, not as a separate ad hoc extension point.
 */
interface LimitsOverrideInterface
{
    public function maxGroupParticipants(): ?int;

    public function historyDays(): ?int;

    public function showBranding(): bool;
}
