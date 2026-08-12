<?php

namespace Converse\Chat\Http\Requests;

use Converse\Chat\Services\EventRsvpService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RespondToEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', Rule::in(EventRsvpService::STATUSES)],
        ];
    }
}
