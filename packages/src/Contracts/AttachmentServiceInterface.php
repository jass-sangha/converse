<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Message;
use Converse\Chat\Models\MessageAttachment;
use Illuminate\Http\UploadedFile;

interface AttachmentServiceInterface
{
    public function upload(UploadedFile $file, int $userId): MessageAttachment;

    /**
     * @param  int[]  $attachmentIds
     */
    public function attachToMessage(array $attachmentIds, Message $message, int $userId): void;
}
