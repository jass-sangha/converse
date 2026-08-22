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
        $messages = config('chat.table_names.messages', 'chat_messages');

        Schema::create($messages, function (Blueprint $table) use ($conversations) {
            $table->id();
            $table->foreignId('conversation_id')->constrained($conversations)->cascadeOnDelete();
            $table->nullableMorphs('chatable');
            $table->string('type')->default('text');
            $table->text('body')->nullable();
            // Computed at write time (see Message::hasLinkInBody(), set in
            // MessageService::send()/update()) so MessageRepository::media()'s 'links' filter
            // can use this index instead of a leading-wildcard `body LIKE '%http%'` scan.
            $table->boolean('has_link')->default(false)->index();
            $table->unsignedBigInteger('reply_to_message_id')->nullable();
            $table->unsignedBigInteger('forwarded_from_message_id')->nullable();
            $table->boolean('is_forwarded')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamp('edited_at')->nullable();
            $table->timestamp('deleted_for_everyone_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
            $table->index('expires_at');
            $table->index('type');
        });

        Schema::table($messages, function (Blueprint $table) use ($messages) {
            $table->foreign('reply_to_message_id')->references('id')->on($messages)->nullOnDelete();
            $table->foreign('forwarded_from_message_id')->references('id')->on($messages)->nullOnDelete();
        });

        // SQLite has no FULLTEXT/tsvector support — MessageRepository::search() falls back to
        // an escaped LIKE scan there (fine for tests/tiny installs), and only gets the real
        // index on MySQL/Postgres where production-scale message search actually runs.
        if (in_array(DB::connection()->getDriverName(), ['mysql', 'pgsql'], true)) {
            Schema::table($messages, function (Blueprint $table) {
                $table->fullText('body');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists(config('chat.table_names.messages', 'chat_messages'));
    }
};
