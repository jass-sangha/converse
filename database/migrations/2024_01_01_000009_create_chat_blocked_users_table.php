<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.blocked_users', 'chat_blocked_users'), function (Blueprint $table) {
            $table->id();
            $table->morphs('blocker');
            $table->morphs('blocked');
            $table->timestamps();

            $table->unique(['blocker_type', 'blocker_id', 'blocked_type', 'blocked_id'], 'chat_blocked_users_blocker_blocked_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.blocked_users', 'chat_blocked_users'));
    }
};
