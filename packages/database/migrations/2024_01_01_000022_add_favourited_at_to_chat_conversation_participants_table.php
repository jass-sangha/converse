<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(config('chat.table_names.conversation_participants', 'chat_conversation_participants'), function (Blueprint $table) {
            $table->timestamp('favourited_at')->nullable()->after('pinned_at');
        });
    }

    public function down(): void
    {
        Schema::table(config('chat.table_names.conversation_participants', 'chat_conversation_participants'), function (Blueprint $table) {
            $table->dropColumn('favourited_at');
        });
    }
};
