<?php

namespace Riwaaq\Chat\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChatListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'conversation_ids' => ['sometimes', 'array'],
            'conversation_ids.*' => ['integer'],
        ];
    }
}
