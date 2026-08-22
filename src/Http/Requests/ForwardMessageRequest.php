<?php

namespace Riwaaq\Chat\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ForwardMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'conversation_ids' => ['required', 'array', 'min:1', 'max:200'],
            'conversation_ids.*' => ['integer'],
        ];
    }
}
