<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Riwaaq\Chat\Contracts\AttachmentServiceInterface;
use Riwaaq\Chat\Contracts\MediaProcessor;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Models\MessageAttachment;

class AttachmentService implements AttachmentServiceInterface
{
    public function __construct(
        protected MediaProcessor $mediaProcessor,
    ) {}

    public function upload(UploadedFile $file, Model $chatable): MessageAttachment
    {
        $mimeType = $file->getMimeType();
        $category = $this->resolveCategory($mimeType);

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

    // Every mime type not explicitly categorized falls back to 'document' — the generic
    // file-card renderer — so any file type can be shared rather than being rejected.
    protected function resolveCategory(string $mimeType): string
    {
        foreach (config('chat.media.mime_types', []) as $category => $mimeTypes) {
            if (in_array($mimeType, $mimeTypes, true)) {
                return $category;
            }
        }

        return 'document';
    }
}
