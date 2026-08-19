<?php

namespace Riwaaq\Chat\Contracts;

use Riwaaq\Chat\Models\MessageAttachment;

interface MediaProcessor
{
    public function supports(string $mimeType): bool;

    /**
     * @return array{width?: int, height?: int, duration_seconds?: int, thumbnail_path?: string}
     */
    public function process(MessageAttachment $attachment): array;
}
