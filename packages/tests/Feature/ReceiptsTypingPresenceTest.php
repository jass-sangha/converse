<?php

use Converse\Chat\Events\UserTyping;
use Converse\Chat\Models\ConversationParticipant;
use Converse\Chat\Tests\Fixtures\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

function presenceUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('marks messages delivered and read, and never regresses on an earlier read call', function () {
    $alice = presenceUser('alice-receipt@example.com');
    $bob = presenceUser('bob-receipt@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participant_ids' => [$bob->id],
    ])->json('data.id');

    $ids = [];
    foreach (range(1, 10) as $i) {
        $ids[] = $this->actingAs($alice)
            ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => "msg {$i}"])
            ->json('data.id');
    }

    $this->actingAs($bob)->postJson("/api/chat/conversations/{$conversationId}/receipts/delivered")->assertNoContent();

    $this->actingAs($bob)->postJson("/api/chat/conversations/{$conversationId}/receipts/read", [
        'up_to_message_id' => $ids[9],
    ])->assertNoContent();

    $participant = ConversationParticipant::query()
        ->where('conversation_id', $conversationId)
        ->where('user_id', $bob->id)
        ->first();

    expect($participant->last_read_message_id)->toBe($ids[9]);

    // Regress attempt: marking read up to an earlier message must not move state backward.
    $this->actingAs($bob)->postJson("/api/chat/conversations/{$conversationId}/receipts/read", [
        'up_to_message_id' => $ids[4],
    ])->assertNoContent();

    $participant->refresh();
    expect($participant->last_read_message_id)->toBe($ids[9]);
});

it('never writes to the database when broadcasting a typing indicator', function () {
    $alice = presenceUser('alice-typing@example.com');
    $bob = presenceUser('bob-typing@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participant_ids' => [$bob->id],
    ])->json('data.id');

    Event::fake();
    DB::enableQueryLog();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/typing", ['state' => 'start'])
        ->assertNoContent();

    $writes = collect(DB::getQueryLog())->filter(
        fn ($entry) => str_starts_with(strtolower($entry['query']), 'insert')
            || str_starts_with(strtolower($entry['query']), 'update')
            || str_starts_with(strtolower($entry['query']), 'delete')
    );

    expect($writes)->toHaveCount(0);

    Event::assertDispatched(UserTyping::class);

    DB::disableQueryLog();
});

it('debounces presence heartbeat db writes and reports online status', function () {
    $alice = presenceUser('alice-presence@example.com');

    $this->actingAs($alice)->postJson('/api/chat/presence/heartbeat')->assertNoContent();

    $status = $this->actingAs($alice)->getJson("/api/chat/users/{$alice->id}/presence")->assertOk();
    expect($status->json('data.is_online'))->toBeTrue();

    DB::enableQueryLog();
    $this->actingAs($alice)->postJson('/api/chat/presence/heartbeat')->assertNoContent();
    $writes = collect(DB::getQueryLog())->filter(
        fn ($entry) => str_starts_with(strtolower($entry['query']), 'insert')
            || str_starts_with(strtolower($entry['query']), 'update')
    );
    DB::disableQueryLog();

    // Second heartbeat within the same debounce window should not touch chat_user_presence again.
    expect($writes)->toHaveCount(0);
});
