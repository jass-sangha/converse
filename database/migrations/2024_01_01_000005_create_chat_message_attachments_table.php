<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.message_attachments', 'chat_message_attachments'), function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')
                ->nullable()
                ->constrained(config('chat.table_names.messages', 'chat_messages'))
                ->cascadeOnDelete();
            $table->morphs('uploader');
            $table->string('disk');
            $table->string('path');
            $table->string('original_filename')->nullable();
            $table->string('mime_type');
            $table->unsignedBigInteger('size_bytes');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.message_attachments', 'chat_message_attachments'));
    }
};
