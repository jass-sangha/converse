<?php

namespace Converse\Chat\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ChatUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $nameField = config('chat.user_search.name_field', 'name');
        $avatarField = config('chat.user_search.avatar_field', 'avatar');

        return [
            'type' => $this->resource->getMorphClass(),
            'id' => $this->getKey(),
            'name' => data_get($this->resource, $nameField),
            'avatar_url' => $this->resolveAvatarUrl(data_get($this->resource, $avatarField)),
        ];
    }

    protected function resolveAvatarUrl(mixed $value): ?string
    {
        if (! $value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, '/')) {
            return $value;
        }

        return Storage::disk(config('chat.media.disk', 'chat'))->url($value);
    }
}
