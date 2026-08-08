<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.user_presence', 'chat_user_presence'), function (Blueprint $table) {
            $table->id();
            $table->string('chatable_type');
            $table->unsignedBigInteger('chatable_id');
            $table->timestamp('last_seen_at')->nullable();
            $table->boolean('is_online')->default(false);
            $table->timestamps();

            $table->unique(['chatable_type', 'chatable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.user_presence', 'chat_user_presence'));
    }
};
