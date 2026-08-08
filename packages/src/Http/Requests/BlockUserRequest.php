<?php

namespace Converse\Chat\Http\Requests;

use Converse\Chat\Chat;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BlockUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'chatable_type' => ['required', 'string', Rule::in(array_keys(Chat::chatableModels()))],
            'chatable_id' => ['required', 'integer'],
        ];
    }
}
