<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.conversations', 'chat_conversations'), function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('private');
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->string('avatar_path')->nullable();
            $table->nullableMorphs('creator');
            $table->unsignedInteger('disappearing_messages_ttl')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();

            $table->index('last_activity_at');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.conversations', 'chat_conversations'));
    }
};
