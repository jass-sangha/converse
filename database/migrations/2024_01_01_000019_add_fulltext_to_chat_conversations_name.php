<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $conversations = config('chat.table_names.conversations', 'chat_conversations');

        // Same reasoning as chat_messages.body's FULLTEXT index (see the messages table
        // migration): ConversationRepository::getForUser()'s name search was a leading-
        // wildcard `name LIKE '%term%'` scan, which can't use any index. SQLite (tests/tiny
        // installs) has no FULLTEXT support and keeps the LIKE fallback.
        if (in_array(DB::connection()->getDriverName(), ['mysql', 'pgsql'], true)) {
            Schema::table($conversations, function (Blueprint $table) {
                $table->fullText('name');
            });
        }
    }

    public function down(): void
    {
        if (in_array(DB::connection()->getDriverName(), ['mysql', 'pgsql'], true)) {
            Schema::table(config('chat.table_names.conversations', 'chat_conversations'), function (Blueprint $table) {
                $table->dropFullText(['name']);
            });
        }
    }
};
