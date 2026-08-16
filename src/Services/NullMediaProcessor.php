<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\MediaProcessor;
use Converse\Chat\Models\MessageAttachment;

/**
 * No-op default binding. The package ships zero dependency on ffmpeg/getid3/image
 * libraries — consuming apps bind their own MediaProcessor implementation to get
 * real thumbnails/durations (see the README extension example).
 */
class NullMediaProcessor implements MediaProcessor
{
    public function supports(string $mimeType): bool
    {
        return false;
    }

    public function process(MessageAttachment $attachment): array
    {
        return [];
    }
}
