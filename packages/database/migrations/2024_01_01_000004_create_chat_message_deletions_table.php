<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.message_deletions', 'chat_message_deletions'), function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')
                ->constrained(config('chat.table_names.messages', 'chat_messages'))
                ->cascadeOnDelete();
            $table->morphs('chatable');
            $table->timestamp('deleted_at')->nullable();

            $table->unique(
                ['message_id', 'chatable_type', 'chatable_id'],
                'message_deletion_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.message_deletions', 'chat_message_deletions'));
    }
};
