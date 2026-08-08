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
        $avatarField = config('chat.user_search.avatar_field', 'avatar');
        $disk = config('chat.media.disk', 'chat');

        $current = data_get($user, $avatarField);

        if ($current && ! str_starts_with($current, 'http') && ! str_starts_with($current, '/')) {
            Storage::disk($disk)->delete($current);
        }

        $path = $request->file('avatar')->store('user-avatars', $disk);

        $user->{$avatarField} = $path;
        $user->save();

        return new ChatUserResource($user);
    }

    public function showSettings(Request $request)
    {
        $setting = $this->settings->get($request->user());

        return response()->json(['data' => [
            'show_last_seen' => $setting->show_last_seen,
            'show_read_receipts' => $setting->show_read_receipts,
        ]]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'show_last_seen' => ['sometimes', 'boolean'],
            'show_read_receipts' => ['sometimes', 'boolean'],
        ]);

        $setting = $this->settings->update($request->user(), $data);

        return response()->json(['data' => [
            'show_last_seen' => $setting->show_last_seen,
            'show_read_receipts' => $setting->show_read_receipts,
        ]]);
    }
}
