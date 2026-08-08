<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $conversations = config('chat.table_names.conversations', 'chat_conversations');
        $messages = config('chat.table_names.messages', 'chat_messages');

        Schema::create($messages, function (Blueprint $table) use ($conversations) {
            $table->id();
            $table->foreignId('conversation_id')->constrained($conversations)->cascadeOnDelete();
            $table->nullableMorphs('chatable');
            $table->string('type')->default('text');
            $table->text('body')->nullable();
            $table->unsignedBigInteger('reply_to_message_id')->nullable();
            $table->unsignedBigInteger('forwarded_from_message_id')->nullable();
            $table->boolean('is_forwarded')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamp('edited_at')->nullable();
            $table->timestamp('deleted_for_everyone_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
            $table->index('expires_at');
        });

        Schema::table($messages, function (Blueprint $table) use ($messages) {
            $table->foreign('reply_to_message_id')->references('id')->on($messages)->nullOnDelete();
            $table->foreign('forwarded_from_message_id')->references('id')->on($messages)->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.messages', 'chat_messages'));
    }
};
