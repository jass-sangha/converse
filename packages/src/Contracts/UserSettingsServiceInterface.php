<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\UserSetting;
use Illuminate\Database\Eloquent\Model;

interface UserSettingsServiceInterface
{
    public function get(Model $chatable): UserSetting;

    public function update(Model $chatable, array $data): UserSetting;

    public function allowsLastSeen(Model $chatable): bool;

    public function allowsReadReceipts(Model $chatable): bool;
}
