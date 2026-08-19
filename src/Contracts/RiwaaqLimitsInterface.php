<?php

namespace Riwaaq\Chat\Contracts;

/**
 * The single place every gating rule (group size, message history, branding) reads its
 * limits from. Every consumer — ConversationLimitService, Message::scopeVisibleWithinPlan(),
 * ChatConfig — depends on this interface, never on config('riwaaq.*') or the
 * riwaaq-pro class_exists() check directly, so that check stays centralized in one
 * implementation (RiwaaqLimits) instead of scattered across the codebase.
 */
interface RiwaaqLimitsInterface
{
    public function maxGroupParticipants(): ?int;

    public function historyDays(): ?int;

    public function showBranding(): bool;
}
