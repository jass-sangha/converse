<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Riwaaq\Chat\Contracts\UserSettingsServiceInterface;
use Riwaaq\Chat\Models\UserSetting;

class UserSettingsService implements UserSettingsServiceInterface
{
    public function get(Model $chatable): UserSetting
    {
        return UserSetting::query()->firstOrCreate(
            ['chatable_type' => $chatable->getMorphClass(), 'chatable_id' => $chatable->getKey()],
            [
                'show_last_seen' => config('chat.privacy.last_seen_default', true),
                'show_read_receipts' => config('chat.privacy.read_receipts_default', true),
                'show_typing_indicator' => config('chat.privacy.typing_indicator_default', true),
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
        return $this->get($chatable)->lastSeenVisible();
    }

    public function allowsReadReceipts(Model $chatable): bool
    {
        return $this->get($chatable)->readReceiptsVisible();
    }

    // Deliberately skips get()'s firstOrCreate: typing events fire on every keystroke, and this
    // check must never incur a write — a plain read falls back to the configured default for a
    // chatable that has no settings row yet (mirroring what firstOrCreate would have seeded).
    public function allowsTypingIndicator(Model $chatable): bool
    {
        $setting = UserSetting::query()
            ->where('chatable_type', $chatable->getMorphClass())
            ->where('chatable_id', $chatable->getKey())
            ->first(['show_typing_indicator', 'typing_indicator_hidden_until']);

        return $setting === null
            ? config('chat.privacy.typing_indicator_default', true)
            : $setting->typingIndicatorVisible();
    }
}
