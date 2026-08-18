<?php

namespace Converse\Chat\Contracts;

/**
 * The single place every gating rule (group size, message history, branding) reads its
 * limits from. Every consumer — ConversationLimitService, Message::scopeVisibleWithinPlan(),
 * ChatConfig — depends on this interface, never on config('converse.*') or the
 * converse-pro class_exists() check directly, so that check stays centralized in one
 * implementation (ConverseLimits) instead of scattered across the codebase.
 */
interface ConverseLimitsInterface
{
    public function maxGroupParticipants(): ?int;

    public function historyDays(): ?int;

    public function showBranding(): bool;
}
