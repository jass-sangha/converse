<?php

namespace Converse\Chat\Http\Resources;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\UserSettingsServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ChatUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $nameField = Chat::nameFieldFor($this->resource->getMorphClass());
        $setting = app(UserSettingsServiceInterface::class)->get($this->resource);

        return [
            'type' => $this->resource->getMorphClass(),
            'id' => $this->getKey(),
            'name' => data_get($this->resource, $nameField),
            'avatar_url' => $this->resolveAvatarUrl($setting->avatar_path),
            'about' => $setting->about,
        ];
    }

    /**
     * Avatars live in the package's own `chat_user_settings` table (keyed by chatable),
     * never on the host's `users` table — the package stays self-contained without
     * requiring a migration on a model it doesn't own.
     */
    protected function resolveAvatarUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/')) {
            return $path;
        }

        return Storage::disk(config('chat.media.disk', 'chat'))->url($path);
    }
}
