<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(config('chat.table_names.user_settings', 'chat_user_settings'), function (Blueprint $table) {
            $table->string('avatar_path')->nullable()->after('chatable_id');
        });
    }

    public function down(): void
    {
        Schema::table(config('chat.table_names.user_settings', 'chat_user_settings'), function (Blueprint $table) {
            $table->dropColumn('avatar_path');
        });
    }
};
