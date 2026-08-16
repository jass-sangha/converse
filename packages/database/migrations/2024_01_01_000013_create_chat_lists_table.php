<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.lists', 'chat_lists'), function (Blueprint $table) {
            $table->id();
            $table->morphs('chatable');
            $table->string('name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.lists', 'chat_lists'));
    }
};
