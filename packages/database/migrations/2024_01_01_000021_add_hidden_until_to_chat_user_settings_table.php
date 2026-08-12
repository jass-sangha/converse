<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(config('chat.table_names.user_settings', 'chat_user_settings'), function (Blueprint $table) {
            $table->timestamp('last_seen_hidden_until')->nullable()->after('show_last_seen');
            $table->timestamp('read_receipts_hidden_until')->nullable()->after('show_read_receipts');
        });
    }

    public function down(): void
    {
        Schema::table(config('chat.table_names.user_settings', 'chat_user_settings'), function (Blueprint $table) {
            $table->dropColumn(['last_seen_hidden_until', 'read_receipts_hidden_until']);
        });
    }
};
