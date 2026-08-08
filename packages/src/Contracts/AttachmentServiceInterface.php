<?php

namespace Converse\Chat\Contracts;

use Converse\Chat\Models\Message;
use Converse\Chat\Models\MessageAttachment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;

interface AttachmentServiceInterface
{
    public function upload(UploadedFile $file, Model $chatable): MessageAttachment;

    /**
     * @param  int[]  $attachmentIds
     */
    public function attachToMessage(array $attachmentIds, Message $message, Model $chatable): void;
}
