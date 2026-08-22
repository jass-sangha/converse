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

        Schema::create($conversations, function (Blueprint $table) {
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

        // Same reasoning as chat_messages.body's FULLTEXT index (see that table's migration):
        // ConversationRepository::getForUser()'s name search was a leading-wildcard
        // `name LIKE '%term%'` scan, which can't use any index. SQLite (tests/tiny installs)
        // has no FULLTEXT support and keeps the LIKE fallback.
        if (in_array(DB::connection()->getDriverName(), ['mysql', 'pgsql'], true)) {
            Schema::table($conversations, function (Blueprint $table) {
                $table->fullText('name');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.conversations', 'chat_conversations'));
    }
};
