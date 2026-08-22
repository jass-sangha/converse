<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Riwaaq\Chat\Models\UserSetting;

interface UserSettingsServiceInterface
{
    public function get(Model $chatable): UserSetting;

    /**
     * Warms get()'s memoization cache for a whole group of chatables in one query per morph
     * type (typically one query total), instead of one query per chatable when each is fetched
     * individually later (e.g. one allowsLastSeen() call per row in a presence sweep). A
     * chatable with no existing row falls through to get()'s own firstOrCreate() on first
     * individual access — this only preloads what's already there.
     *
     * @param  iterable<Model>  $chatables
     */
    public function preload(iterable $chatables): void;

    public function update(Model $chatable, array $data): UserSetting;

    public function allowsLastSeen(Model $chatable): bool;

    public function allowsReadReceipts(Model $chatable): bool;

    public function allowsTypingIndicator(Model $chatable): bool;
}
