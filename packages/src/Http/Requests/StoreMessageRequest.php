<?php

namespace Converse\Chat\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', Rule::in(['text', 'image', 'video', 'audio', 'voice', 'document', 'location', 'contact'])],
            'body' => ['required_if:type,text', 'nullable', 'string'],
            'reply_to_message_id' => ['nullable', 'integer'],
            'metadata' => ['nullable', 'array'],
            'metadata.lat' => ['required_if:type,location', 'numeric', 'between:-90,90'],
            'metadata.lng' => ['required_if:type,location', 'numeric', 'between:-180,180'],
            'metadata.name' => ['required_if:type,contact', 'string', 'max:255'],
            'metadata.phones' => ['required_if:type,contact', 'array', 'min:1'],
            'attachment_ids' => ['required_if:type,image,video,audio,voice,document', 'sometimes', 'array', 'min:1'],
            'attachment_ids.*' => ['integer'],
        ];
    }
}
