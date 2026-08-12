<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\UserSettingsServiceInterface;
use Converse\Chat\Http\Resources\ChatUserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function __construct(
        protected UserSettingsServiceInterface $settings,
    ) {}

    public function updateAvatar(Request $request)
    {
        $request->validate(['avatar' => ['required', 'image', 'max:5120']]);

        $user = $request->user();
        $disk = config('chat.media.disk', 'chat');

        $setting = $this->settings->get($user);

        if ($setting->avatar_path) {
            Storage::disk($disk)->delete($setting->avatar_path);
        }

        $path = $request->file('avatar')->store('user-avatars', $disk);

        $this->settings->update($user, ['avatar_path' => $path]);

        return new ChatUserResource($user);
    }

    public function destroyAvatar(Request $request)
    {
        $user = $request->user();
        $disk = config('chat.media.disk', 'chat');

        $setting = $this->settings->get($user);

        if ($setting->avatar_path) {
            Storage::disk($disk)->delete($setting->avatar_path);
        }

        $this->settings->update($user, ['avatar_path' => null]);

        return new ChatUserResource($user);
    }

    public function showSettings(Request $request)
    {
        $setting = $this->settings->get($request->user());

        return response()->json(['data' => $this->settingsPayload($setting)]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'show_last_seen' => ['sometimes', 'boolean'],
            'show_read_receipts' => ['sometimes', 'boolean'],
            'last_seen_hidden_until' => ['sometimes', 'nullable', 'date'],
            'read_receipts_hidden_until' => ['sometimes', 'nullable', 'date'],
            'about' => ['sometimes', 'nullable', 'string', 'max:139'],
        ]);

        $setting = $this->settings->update($request->user(), $data);

        return response()->json(['data' => $this->settingsPayload($setting)]);
    }

    protected function settingsPayload($setting): array
    {
        return [
            // Effective, not raw: true only when not currently inside a hidden-until window —
            // see UserSetting::lastSeenVisible()/readReceiptsVisible().
            'show_last_seen' => $setting->lastSeenVisible(),
            'show_read_receipts' => $setting->readReceiptsVisible(),
            'last_seen_hidden_until' => $setting->last_seen_hidden_until,
            'read_receipts_hidden_until' => $setting->read_receipts_hidden_until,
            'about' => $setting->about,
        ];
    }
}
