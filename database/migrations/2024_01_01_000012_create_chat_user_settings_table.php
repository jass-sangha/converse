<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.user_settings', 'chat_user_settings'), function (Blueprint $table) {
            $table->id();
            $table->string('chatable_type');
            $table->unsignedBigInteger('chatable_id');
            $table->string('avatar_path')->nullable();
            $table->string('about')->nullable();
            $table->boolean('show_last_seen')->default(true);
            $table->timestamp('last_seen_hidden_until')->nullable();
            $table->boolean('show_read_receipts')->default(true);
            $table->timestamp('read_receipts_hidden_until')->nullable();
            $table->boolean('show_typing_indicator')->default(true);
            $table->timestamps();

            $table->unique(['chatable_type', 'chatable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.user_settings', 'chat_user_settings'));
    }
};
