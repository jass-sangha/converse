<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.user_settings', 'chat_user_settings'), function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->boolean('show_last_seen')->default(true);
            $table->boolean('show_read_receipts')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.user_settings', 'chat_user_settings'));
    }
};
