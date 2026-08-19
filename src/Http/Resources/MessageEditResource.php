<?php

namespace Riwaaq\Chat\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageEditResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'previous_body' => $this->previous_body,
            'edited_at' => $this->edited_at,
        ];
    }
}
