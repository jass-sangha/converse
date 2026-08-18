<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(config('chat.table_names.license', 'converse_license'), function (Blueprint $table) {
            $table->id();
            $table->string('plan')->default('free');
            $table->string('license_key')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.license', 'converse_license'));
    }
};
