<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\UserSettingsServiceInterface;
use Converse\Chat\Models\UserSetting;
use Illuminate\Database\Eloquent\Model;

class UserSettingsService implements UserSettingsServiceInterface
{
    public function get(Model $chatable): UserSetting
    {
        return UserSetting::query()->firstOrCreate(
            ['chatable_type' => $chatable->getMorphClass(), 'chatable_id' => $chatable->getKey()],
            [
                'show_last_seen' => config('chat.privacy.last_seen_default', true),
                'show_read_receipts' => config('chat.privacy.read_receipts_default', true),
            ],
        );
    }

    public function update(Model $chatable, array $data): UserSetting
    {
        $setting = $this->get($chatable);
        $setting->update($data);

        return $setting;
    }

    public function allowsLastSeen(Model $chatable): bool
    {
        return $this->get($chatable)->show_last_seen;
    }

    public function allowsReadReceipts(Model $chatable): bool
    {
        return $this->get($chatable)->show_read_receipts;
    }
}
