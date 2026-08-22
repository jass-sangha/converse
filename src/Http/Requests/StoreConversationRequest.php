<?php

namespace Riwaaq\Chat\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Services\ParticipantService;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['private', 'group'])],
            'participants' => ['required', 'array', 'min:1', 'max:'.ParticipantService::MAX_PARTICIPANTS_PER_CONVERSATION],
            'participants.*.type' => ['required', 'string', Rule::in(array_keys(Chat::chatableModels()))],
            'participants.*.id' => ['required', 'integer'],
            'name' => ['nullable', 'string', 'max:255', 'required_if:type,group'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
