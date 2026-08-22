<?php

namespace Riwaaq\Chat\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Services\ParticipantService;

class AddParticipantsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'participants' => ['required', 'array', 'min:1', 'max:'.ParticipantService::MAX_PARTICIPANTS_PER_CONVERSATION],
            'participants.*.type' => ['required', 'string', Rule::in(array_keys(Chat::chatableModels()))],
            'participants.*.id' => ['required', 'integer'],
        ];
    }
}
