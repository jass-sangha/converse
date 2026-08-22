<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Closes the findOrCreatePrivate() race: the app-level "does a private conversation
        // between these two already exist" check and the create() that follows it aren't
        // atomic, so two concurrent requests starting the same DM can both pass the check and
        // each create their own conversation. This column is the DB-level backstop —
        // deterministic sorted "type|id" pair of the two participants, set only for private
        // conversations (null for group ones, where multiple nulls are fine under a unique
        // index) — so the second insert fails on the unique constraint instead of silently
        // creating a duplicate thread.
        Schema::table(config('chat.table_names.conversations', 'chat_conversations'), function (Blueprint $table) {
            $table->string('private_pair_key')->nullable()->after('type');
            $table->unique('private_pair_key');
        });
    }

    public function down(): void
    {
        Schema::table(config('chat.table_names.conversations', 'chat_conversations'), function (Blueprint $table) {
            $table->dropUnique(['private_pair_key']);
            $table->dropColumn('private_pair_key');
        });
    }
};
