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
            // Deterministic sorted "type|id" pair of the two participants, set only for private
            // conversations (null for group ones — multiple nulls are fine under a unique
            // index). Backs findOrCreatePrivate()'s DB-level dedupe: its own "does one already
            // exist" check is app-level and racy under concurrent requests, so this is what
            // actually stops two simultaneous requests from creating duplicate DM threads for
            // the same pair — the loser's insert fails the unique constraint and falls back to
            // the winner's row instead.
            $table->string('private_pair_key')->nullable();
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->string('avatar_path')->nullable();
            $table->nullableMorphs('creator');
            $table->unsignedInteger('disappearing_messages_ttl')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();

            $table->unique('private_pair_key');
            $table->index('last_activity_at');
            $table->index('type');
        });

        // Same reasoning as chat_messages.body's FULLTEXT index (see that migration):
        // ConversationRepository::getForUser()'s name search was a leading-wildcard
        // `LIKE '%term%'` scan that can't use an index. SQLite (tests/tiny installs) has
        // no FULLTEXT support and keeps the LIKE fallback.
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
