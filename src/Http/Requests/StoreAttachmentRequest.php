<?php

namespace Riwaaq\Chat\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Riwaaq\Chat\Support\UploadLimitGuard;

class StoreAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        UploadLimitGuard::assertWithinServerLimits($this, 'file');
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file'],
        ];
    }
}
