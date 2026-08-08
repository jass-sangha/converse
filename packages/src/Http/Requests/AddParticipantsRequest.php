<?php

namespace Converse\Chat\Http\Requests;

use Converse\Chat\Chat;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddParticipantsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'participants' => ['required', 'array', 'min:1'],
            'participants.*.type' => ['required', 'string', Rule::in(array_keys(Chat::chatableModels()))],
            'participants.*.id' => ['required', 'integer'],
        ];
    }
}
