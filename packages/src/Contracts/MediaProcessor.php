<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\MessageAttachment;

interface MediaProcessor
{
    public function supports(string $mimeType): bool;

    /**
     * @return array{width?: int, height?: int, duration_seconds?: int, thumbnail_path?: string}
     */
    public function process(MessageAttachment $attachment): array;
}
