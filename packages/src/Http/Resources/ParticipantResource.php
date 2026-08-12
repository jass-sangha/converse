<?php

namespace Converse\Chat\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'chatable_type' => $this->chatable_type,
            'chatable_id' => $this->chatable_id,
            'role' => $this->role?->value,
            'joined_at' => $this->joined_at,
            'left_at' => $this->left_at,
            'muted_until' => $this->muted_until,
            'archived_at' => $this->archived_at,
            'pinned_at' => $this->pinned_at,
            'favourited_at' => $this->favourited_at,
        ];
    }
}
