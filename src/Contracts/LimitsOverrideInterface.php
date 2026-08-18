<?php

namespace Converse\Chat\Contracts;

/**
 * The stable contract between this package and the paid `converse-pro` add-on. If
 * `converse-pro` is installed, it binds a class named exactly `ConversePro\LimitsOverride`
 * implementing this interface — see ConverseLimits for the class_exists() hook that looks
 * for it. This is the *entire* surface paid features are allowed to override; every future
 * paid feature's limit belongs here, not as a separate ad hoc extension point.
 */
interface LimitsOverrideInterface
{
    public function maxGroupParticipants(): ?int;

    public function historyDays(): ?int;

    public function showBranding(): bool;
}
