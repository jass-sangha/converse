<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.poll_votes', 'chat_poll_votes'), function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')
                ->constrained(config('chat.table_names.messages', 'chat_messages'))
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('option_index');
            $table->morphs('chatable');
            $table->timestamps();

            $table->unique(['message_id', 'option_index', 'chatable_type', 'chatable_id'], 'chat_poll_votes_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.poll_votes', 'chat_poll_votes'));
    }
};
