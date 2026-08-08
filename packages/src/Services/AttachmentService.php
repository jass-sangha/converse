<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\AttachmentServiceInterface;
use Converse\Chat\Contracts\MediaProcessor;
use Converse\Chat\Models\Message;
use Converse\Chat\Models\MessageAttachment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;

class AttachmentService implements AttachmentServiceInterface
{
    public function __construct(
        protected MediaProcessor $mediaProcessor,
    ) {}

    public function upload(UploadedFile $file, Model $chatable): MessageAttachment
    {
        $mimeType = $file->getMimeType();
        $category = $this->resolveCategory($mimeType);

        abort_if($category === null, 422, 'Unsupported file type.');

        $maxKilobytes = config("chat.media.max_sizes.{$category}");
        abort_if($maxKilobytes && $file->getSize() > $maxKilobytes * 1024, 422, 'File is too large.');

        $disk = config('chat.media.disk', 'chat');
        $path = $file->store("attachments/{$category}", $disk);

        $attachment = MessageAttachment::query()->create([
            'uploader_type' => $chatable->getMorphClass(),
            'uploader_id' => $chatable->getKey(),
            'disk' => $disk,
            'path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $mimeType,
            'size_bytes' => $file->getSize(),
        ]);

        if ($this->mediaProcessor->supports($mimeType)) {
            $attachment->update($this->mediaProcessor->process($attachment));
        }

        return $attachment;
    }

    public function attachToMessage(array $attachmentIds, Message $message, Model $chatable): void
    {
        $attachments = MessageAttachment::query()->whereIn('id', array_unique($attachmentIds))->get();

        foreach ($attachments as $attachment) {
            $uploadedByChatable = $attachment->uploader_type === $chatable->getMorphClass()
                && $attachment->uploader_id === $chatable->getKey();

            abort_if(! $uploadedByChatable, 403);
            abort_if($attachment->message_id !== null, 422, 'Attachment already attached to a message.');
        }

        MessageAttachment::query()
            ->whereIn('id', $attachments->pluck('id'))
            ->update(['message_id' => $message->id]);
    }

    protected function resolveCategory(string $mimeType): ?string
    {
        foreach (config('chat.media.mime_types', []) as $category => $mimeTypes) {
            if (in_array($mimeType, $mimeTypes, true)) {
                return $category;
            }
        }

        return null;
    }
}
