<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.event_rsvps', 'chat_event_rsvps'), function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')
                ->constrained(config('chat.table_names.messages', 'chat_messages'))
                ->cascadeOnDelete();
            $table->string('status', 16);
            $table->morphs('chatable');
            $table->timestamps();

            $table->unique(['message_id', 'chatable_type', 'chatable_id'], 'chat_event_rsvps_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.event_rsvps', 'chat_event_rsvps'));
    }
};
