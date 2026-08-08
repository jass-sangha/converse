<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.conversation_participants', 'chat_conversation_participants'), function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')
                ->constrained(config('chat.table_names.conversations', 'chat_conversations'))
                ->cascadeOnDelete();
            $table->morphs('chatable');
            $table->string('role')->default('member');
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->timestamp('muted_until')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamp('pinned_at')->nullable();
            $table->unsignedBigInteger('last_read_message_id')->nullable();
            $table->timestamps();

            $table->unique(['conversation_id', 'chatable_type', 'chatable_id']);
            $table->index('left_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.conversation_participants', 'chat_conversation_participants'));
    }
};
