<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.message_edits', 'chat_message_edits'), function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')
                ->constrained(config('chat.table_names.messages', 'chat_messages'))
                ->cascadeOnDelete();
            // The body as it read *before* this edit overwrote it — the row is the snapshot,
            // not the change, so the previous version stays readable even after the message
            // itself has been edited again since.
            $table->text('previous_body')->nullable();
            $table->timestamp('edited_at');
            $table->timestamps();

            $table->index(['message_id', 'edited_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.message_edits', 'chat_message_edits'));
    }
};
