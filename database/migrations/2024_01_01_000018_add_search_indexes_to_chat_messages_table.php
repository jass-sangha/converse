<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $messages = config('chat.table_names.messages', 'chat_messages');

        Schema::table($messages, function (Blueprint $table) {
            $table->index('type');
        });

        // SQLite has no FULLTEXT/tsvector support — MessageRepository::search() falls back to
        // a plain LIKE scan there (fine for tests/tiny installs), and only gets the real index
        // on MySQL/Postgres where production-scale message search actually runs.
        if (in_array(DB::connection()->getDriverName(), ['mysql', 'pgsql'], true)) {
            Schema::table($messages, function (Blueprint $table) {
                $table->fullText('body');
            });
        }
    }

    public function down(): void
    {
        $messages = config('chat.table_names.messages', 'chat_messages');

        Schema::table($messages, function (Blueprint $table) {
            $table->dropIndex(['type']);
        });

        if (in_array(DB::connection()->getDriverName(), ['mysql', 'pgsql'], true)) {
            Schema::table($messages, function (Blueprint $table) {
                $table->dropFullText(['body']);
            });
        }
    }
};
