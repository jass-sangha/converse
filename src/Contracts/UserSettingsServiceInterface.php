<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Riwaaq\Chat\Models\UserSetting;

interface UserSettingsServiceInterface
{
    public function get(Model $chatable): UserSetting;

    public function update(Model $chatable, array $data): UserSetting;

    public function allowsLastSeen(Model $chatable): bool;

    public function allowsReadReceipts(Model $chatable): bool;

    public function allowsTypingIndicator(Model $chatable): bool;
}
