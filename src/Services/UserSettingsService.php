<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Riwaaq\Chat\Contracts\UserSettingsServiceInterface;
use Riwaaq\Chat\Models\UserSetting;

class UserSettingsService implements UserSettingsServiceInterface
{
    /**
     * Memoizes get() per chatable for this instance's lifetime — bound as a singleton (see
     * ChatServiceProvider), so that's effectively "one request". Without it, resolving a
     * message list's read-receipt status calls allowsReadReceipts() once per receipt (see
     * MessageResource::receiptStatus()) and hits firstOrCreate() fresh each time: 50 messages
     * in a 10-person group could mean hundreds of identical settings queries per response.
     *
     * @var array<string, UserSetting>
     */
    protected array $cache = [];

    public function get(Model $chatable): UserSetting
    {
        $key = $chatable->getMorphClass().':'.$chatable->getKey();

        return $this->cache[$key] ??= UserSetting::query()->firstOrCreate(
            ['chatable_type' => $chatable->getMorphClass(), 'chatable_id' => $chatable->getKey()],
            $this->defaultAttributes(),
        );
    }

    public function preload(iterable $chatables): void
    {
        $byType = collect($chatables)->groupBy(fn (Model $chatable) => $chatable->getMorphClass());

        foreach ($byType as $type => $group) {
            $ids = $group->map(fn (Model $chatable) => $chatable->getKey())->unique()->values();

            $existing = UserSetting::query()
                ->where('chatable_type', $type)
                ->whereIn('chatable_id', $ids)
                ->get()
                ->each(function (UserSetting $setting) {
                    $this->cache[$setting->chatable_type.':'.$setting->chatable_id] = $setting;
                });

            $missingIds = $ids->diff($existing->pluck('chatable_id'));

            if ($missingIds->isEmpty()) {
                continue;
            }

            // Bulk-seed the rest in one INSERT rather than leaving them to fall through to
            // get()'s per-row firstOrCreate() later — most real users never touch privacy
            // settings, so "no row yet" isn't a rare edge case, it's most of any given chunk.
            // insertOrIgnore (not insert) because chatable_type+chatable_id is unique and a
            // concurrent request could have created one of these rows since the SELECT above.
            $now = now();
            $defaults = $this->defaultAttributes();

            UserSetting::query()->insertOrIgnore(
                $missingIds->map(fn ($id) => array_merge($defaults, [
                    'chatable_type' => $type,
                    'chatable_id' => $id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]))->all()
            );

            UserSetting::query()
                ->where('chatable_type', $type)
                ->whereIn('chatable_id', $missingIds)
                ->get()
                ->each(function (UserSetting $setting) {
                    $this->cache[$setting->chatable_type.':'.$setting->chatable_id] = $setting;
                });
        }
    }

    /**
     * @return array{show_last_seen: bool, show_read_receipts: bool, show_typing_indicator: bool}
     */
    protected function defaultAttributes(): array
    {
        return [
            'show_last_seen' => config('chat.privacy.last_seen_default', true),
            'show_read_receipts' => config('chat.privacy.read_receipts_default', true),
            'show_typing_indicator' => config('chat.privacy.typing_indicator_default', true),
        ];
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
