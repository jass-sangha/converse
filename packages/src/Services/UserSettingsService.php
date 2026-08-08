<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\UserSettingsServiceInterface;
use Converse\Chat\Models\UserSetting;

class UserSettingsService implements UserSettingsServiceInterface
{
    public function get(int $userId): UserSetting
    {
        return UserSetting::query()->firstOrCreate(
            ['user_id' => $userId],
            [
                'show_last_seen' => config('chat.privacy.last_seen_default', true),
                'show_read_receipts' => config('chat.privacy.read_receipts_default', true),
            ],
        );
    }

    public function update(int $userId, array $data): UserSetting
    {
        $setting = $this->get($userId);
        $setting->update($data);

        return $setting;
    }

    public function allowsLastSeen(int $userId): bool
    {
        return $this->get($userId)->show_last_seen;
    }

    public function allowsReadReceipts(int $userId): bool
    {
        return $this->get($userId)->show_read_receipts;
    }
}
