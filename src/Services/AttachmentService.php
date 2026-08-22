<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
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

        $quotaMegabytes = config('chat.media.max_storage_per_user_mb');

        if ($quotaMegabytes !== null) {
            $usedBytes = MessageAttachment::query()
                ->where('uploader_type', $chatable->getMorphClass())
                ->where('uploader_id', $chatable->getKey())
                ->sum('size_bytes');

            abort_if($usedBytes + $file->getSize() > $quotaMegabytes * 1024 * 1024, 422, 'Storage quota exceeded.');
        }

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

    /**
     * Deletes each attachment's underlying file(s) unless another (still-current) attachment
     * row references the same disk+path — forward/copyAttachments() clones a row pointing at
     * the original's file rather than duplicating bytes, so deleting on the strength of one
     * row alone would break every forwarded copy. Callers must remove/detach the DB rows for
     * these attachments *before* calling this, so the "still referenced" check only sees rows
     * that genuinely point elsewhere.
     *
     * @param  Collection<int, MessageAttachment>  $attachments
     */
    public function deleteOrphanedFiles(Collection $attachments): void
    {
        if ($attachments->isEmpty()) {
            return;
        }

        // One query per distinct disk in the batch (normally just one disk) instead of one
        // exists() query per attachment — chat:prune-expired-messages calls this with batches
        // of up to 200.
        $stillReferenced = [];

        foreach ($attachments->groupBy('disk') as $disk => $group) {
            $paths = MessageAttachment::query()
                ->where('disk', $disk)
                ->whereIn('path', $group->pluck('path')->unique())
                ->pluck('path');

            foreach ($paths as $path) {
                $stillReferenced["{$disk}\0{$path}"] = true;
            }
        }

        foreach ($attachments as $attachment) {
            if (isset($stillReferenced["{$attachment->disk}\0{$attachment->path}"])) {
                continue;
            }

            Storage::disk($attachment->disk)->delete(array_filter([$attachment->path, $attachment->thumbnail_path]));
        }
    }

    // Mime types are allow-listed via chat.media.mime_types — anything not explicitly
    // categorized is rejected rather than falling back to the generic 'document' bucket. A
    // silent fallback previously let text/html and image/svg+xml through to the public disk,
    // where opening the attachment's same-origin URL would execute them as stored XSS.
    protected function resolveCategory(string $mimeType): string
    {
        foreach (config('chat.media.mime_types', []) as $category => $mimeTypes) {
            if (in_array($mimeType, $mimeTypes, true)) {
                return $category;
            }
        }

        abort(422, 'This file type is not allowed.');
    }
}
