<?php

namespace Riwaaq\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Models\MessageAttachment;

interface AttachmentServiceInterface
{
    public function upload(UploadedFile $file, Model $chatable): MessageAttachment;

    /**
     * @param  int[]  $attachmentIds
     */
    public function attachToMessage(array $attachmentIds, Message $message, Model $chatable): void;
}
