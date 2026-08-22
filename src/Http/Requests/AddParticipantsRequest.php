<?php

namespace Riwaaq\Chat\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Riwaaq\Chat\Chat;

class AddParticipantsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'participants' => ['required', 'array', 'min:1', 'max:200'],
            'participants.*.type' => ['required', 'string', Rule::in(array_keys(Chat::chatableModels()))],
            'participants.*.id' => ['required', 'integer'],
        ];
    }
}
