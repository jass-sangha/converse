<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.list_conversations', 'chat_list_conversations'), function (Blueprint $table) {
            $table->id();
            $table->foreignId('list_id')
                ->constrained(config('chat.table_names.lists', 'chat_lists'))
                ->cascadeOnDelete();
            $table->foreignId('conversation_id')
                ->constrained(config('chat.table_names.conversations', 'chat_conversations'))
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['list_id', 'conversation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.list_conversations', 'chat_list_conversations'));
    }
};
