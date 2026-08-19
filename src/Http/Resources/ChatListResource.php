<?php

namespace Riwaaq\Chat\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'conversation_ids' => $this->whenLoaded('conversations', fn () => $this->conversations->pluck('id')),
            'created_at' => $this->created_at,
        ];
    }
}
