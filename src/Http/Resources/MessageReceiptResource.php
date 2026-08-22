<?php

namespace Riwaaq\Chat\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'chatable_type' => $this->chatable_type,
            'chatable_id' => $this->chatable_id,
            'delivered_at' => $this->delivered_at,
            'read_at' => $this->read_at,
        ];
    }
}
