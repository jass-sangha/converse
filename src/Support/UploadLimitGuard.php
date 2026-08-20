<?php

namespace Riwaaq\Chat\Support;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

/**
 * A single file larger than `upload_max_filesize` isn't caught anywhere in Laravel's default
 * middleware stack (unlike a whole request over `post_max_size`, which
 * `Illuminate\Http\Middleware\ValidatePostSize` already rejects with a clear message before
 * this ever runs) — PHP just marks that file's upload as errored and lets the request through,
 * which normally surfaces as a generic "must be a file" validation error. Report the real
 * cause instead.
 */
class UploadLimitGuard
{
    public static function assertWithinServerLimits(Request $request, string $field): void
    {
        $file = $request->file($field);

        if ($file instanceof UploadedFile && $file->getError() === UPLOAD_ERR_INI_SIZE) {
            throw ValidationException::withMessages([
                $field => sprintf(
                    'This file is larger than the server allows (max %s). Ask the site administrator to raise upload_max_filesize in php.ini.',
                    ini_get('upload_max_filesize'),
                ),
            ]);
        }
    }
}
