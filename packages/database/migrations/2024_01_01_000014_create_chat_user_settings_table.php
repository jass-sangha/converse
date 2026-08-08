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
            $table->boolean('show_last_seen')->default(true);
            $table->boolean('show_read_receipts')->default(true);
            $table->timestamps();

            $table->unique(['chatable_type', 'chatable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.user_settings', 'chat_user_settings'));
    }
};
