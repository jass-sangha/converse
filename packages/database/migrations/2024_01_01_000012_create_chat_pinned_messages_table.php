<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.pinned_messages', 'chat_pinned_messages'), function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')
                ->constrained(config('chat.table_names.conversations', 'chat_conversations'))
                ->cascadeOnDelete();
            $table->foreignId('message_id')
                ->constrained(config('chat.table_names.messages', 'chat_messages'))
                ->cascadeOnDelete();
            $table->morphs('pinner');
            $table->timestamps();

            $table->unique(['conversation_id', 'message_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.pinned_messages', 'chat_pinned_messages'));
    }
};
