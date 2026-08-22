<?php

namespace Riwaaq\Chat\Http\Requests;

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
            'type' => ['sometimes', Rule::in(['text', 'image', 'video', 'audio', 'voice', 'document', 'location', 'contact', 'gif', 'sticker', 'poll', 'event', 'call'])],
            'body' => ['required_if:type,text', 'nullable', 'string', 'max:'.config('chat.message.max_body_length', 4096)],
            'reply_to_message_id' => ['nullable', 'integer'],
            'metadata' => ['nullable', 'array'],
            'metadata.lat' => ['required_if:type,location', 'numeric', 'between:-90,90'],
            'metadata.lng' => ['required_if:type,location', 'numeric', 'between:-180,180'],
            'metadata.name' => ['required_if:type,contact', 'string', 'max:255'],
            'metadata.phones' => ['required_if:type,contact', 'array', 'min:1'],
            'metadata.question' => ['required_if:type,poll', 'string', 'max:255'],
            'metadata.options' => ['required_if:type,poll', 'array', 'min:2', 'max:12'],
            'metadata.options.*' => ['string', 'max:100'],
            'metadata.multiple' => ['sometimes', 'boolean'],
            'metadata.title' => ['required_if:type,event', 'string', 'max:255'],
            'metadata.starts_at' => ['required_if:type,event', 'date'],
            'metadata.location' => ['nullable', 'string', 'max:255'],
            'metadata.location_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'metadata.location_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'metadata.description' => ['nullable', 'string', 'max:1000'],
            'metadata.video' => ['sometimes', 'boolean'],
            'metadata.duration_seconds' => ['required_if:type,call', 'integer', 'min:0'],
            // `array` alone (no `required_if`) — an unanswered call legitimately logs with zero
            // participants, and Laravel's `required` family treats an empty array as "missing",
            // which would 422 on exactly that case.
            'metadata.participants' => ['present_if:type,call', 'array'],
            'metadata.participants.*.type' => ['required_with:metadata.participants.*.id', 'string'],
            'metadata.participants.*.id' => ['required_with:metadata.participants.*.type', 'integer'],
            // The composer attaches the OG-preview it already fetched (see /link-preview) onto a
            // text message's metadata. Every metadata.* key needs its own rule here — an unlisted
            // nested key is silently stripped from the whole metadata array by validated(), not
            // just that key.
            'metadata.link_preview' => ['nullable', 'array'],
            'metadata.link_preview.url' => ['required_with:metadata.link_preview', 'string'],
            'metadata.link_preview.title' => ['nullable', 'string'],
            'metadata.link_preview.description' => ['nullable', 'string'],
            'metadata.link_preview.image' => ['nullable', 'string'],
            'metadata.link_preview.site_name' => ['nullable', 'string'],
            'attachment_ids' => ['required_if:type,image,video,audio,voice,document,gif,sticker', 'sometimes', 'array', 'min:1'],
            'attachment_ids.*' => ['integer'],
        ];
    }
}
