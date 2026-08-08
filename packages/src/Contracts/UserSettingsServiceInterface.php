<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\UserSetting;

interface UserSettingsServiceInterface
{
    public function get(int $userId): UserSetting;

    public function update(int $userId, array $data): UserSetting;

    public function allowsLastSeen(int $userId): bool;

    public function allowsReadReceipts(int $userId): bool;
}
