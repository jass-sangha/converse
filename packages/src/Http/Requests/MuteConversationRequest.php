<?php

namespace Converse\Chat\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MuteConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'muted_until' => ['nullable', 'date'],
        ];
    }
}
