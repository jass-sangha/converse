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
            // Indexed so MessageRepository::media()'s 'links' filter (previously a leading-
            // wildcard `body LIKE '%http%'` full scan) can use it directly instead. Set at
            // write time in MessageService::send()/update() — see Message::hasLinkInBody().
            $table->boolean('has_link')->default(false)->index()->after('body');
        });

        // One-time backfill for rows that existed before this column did — the same body-scan
        // this column exists to replace going forward, but only ever paid once here.
        DB::table($messages)
            ->where('type', 'text')
            ->where('body', 'like', '%http%')
            ->update(['has_link' => true]);
    }

    public function down(): void
    {
        Schema::table(config('chat.table_names.messages', 'chat_messages'), function (Blueprint $table) {
            $table->dropColumn('has_link');
        });
    }
};
