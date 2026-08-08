<?php

namespace Converse\Chat\Models;

use Converse\Chat\Chat;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class MessageAttachment extends Model
{
    protected $fillable = [
        'message_id',
        'uploader_id',
        'uploader_type',
        'disk',
        'path',
        'original_filename',
        'mime_type',
        'size_bytes',
        'width',
        'height',
        'duration_seconds',
        'thumbnail_path',
    ];

    public function getTable(): string
    {
        return Chat::table('message_attachments');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'message_id');
    }

    public function uploader(): MorphTo
    {
        return $this->morphTo();
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail_path
            ? Storage::disk($this->disk)->url($this->thumbnail_path)
            : null;
    }
}
