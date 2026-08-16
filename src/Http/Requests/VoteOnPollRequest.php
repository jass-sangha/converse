<?php

namespace Converse\Chat\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VoteOnPollRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'option_index' => ['required', 'integer', 'min:0'],
        ];
    }
}
