<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Riwaaq\Chat\Contracts\PresenceServiceInterface;
use Riwaaq\Chat\Events\UserTyping;
use Riwaaq\Chat\Models\ConversationParticipant;
use Riwaaq\Chat\Models\UserPresence;
use Riwaaq\Chat\Tests\Fixtures\User;

function presenceUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('marks messages delivered and read, and never regresses on an earlier read call', function () {
    $alice = presenceUser('alice-receipt@example.com');
    $bob = presenceUser('bob-receipt@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
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
        ->where('chatable_type', 'user')
        ->where('chatable_id', $bob->id)
        ->first();

    expect($participant->last_read_message_id)->toBe($ids[9]);

    // Regress attempt: marking read up to an earlier message must not move state backward.
    $this->actingAs($bob)->postJson("/api/chat/conversations/{$conversationId}/receipts/read", [
        'up_to_message_id' => $ids[4],
    ])->assertNoContent();

    $participant->refresh();
    expect($participant->last_read_message_id)->toBe($ids[9]);
});

it('memoizes user-settings lookups within a request instead of one query per receipt', function () {
    $alice = presenceUser('alice-settingsn1@example.com');
    $bob = presenceUser('bob-settingsn1@example.com');
    $carol = presenceUser('carol-settingsn1@example.com');
    $dave = presenceUser('dave-settingsn1@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'N+1 check',
        'participants' => chatableRefs([$bob, $carol, $dave]),
    ])->json('data.id');

    $lastId = null;
    foreach (range(1, 5) as $i) {
        $lastId = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
            'type' => 'text',
            'body' => "msg {$i}",
        ])->assertCreated()->json('data.id');
    }

    // Each message now has a *read* receipt from bob/carol/dave (5 messages x 3 receipts =
    // 15 rows) pointing at just 3 distinct users. receiptStatus() only calls
    // allowsReadReceipts() once a receipt is actually read (undelivered/unread receipts
    // short-circuit first), so without memoization this would be up to 15 separate
    // chat_user_settings lookups for those same 3 users.
    foreach ([$bob, $carol, $dave] as $recipient) {
        $this->actingAs($recipient)->postJson("/api/chat/conversations/{$conversationId}/receipts/read", [
            'up_to_message_id' => $lastId,
        ])->assertNoContent();
    }

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($alice)->getJson("/api/chat/conversations/{$conversationId}/messages")->assertOk();
    $settingsQueries = collect(DB::getQueryLog())->filter(
        fn ($entry) => str_contains($entry['query'], 'chat_user_settings') && str_starts_with(strtolower($entry['query']), 'select')
    );
    DB::disableQueryLog();

    // One lookup per distinct chatable this GET actually needed settings for (bob/carol/dave —
    // alice's own is already warm from sending the messages above), not one per receipt (15).
    expect($settingsQueries)->toHaveCount(3);
});

it('exposes per-recipient delivered/read detail for message info', function () {
    $alice = presenceUser('alice-info@example.com');
    $bob = presenceUser('bob-info@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $messageId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'seen?'])
        ->json('data.id');

    $before = $this->actingAs($alice)->getJson("/api/chat/conversations/{$conversationId}/messages")->assertOk();
    $beforeDetail = collect($before->json('data'))->firstWhere('id', $messageId)['receipt_details'][0];
    expect($beforeDetail['chatable_id'])->toBe($bob->id)
        ->and($beforeDetail['delivered_at'])->toBeNull()
        ->and($beforeDetail['read_at'])->toBeNull();

    $this->actingAs($bob)->postJson("/api/chat/conversations/{$conversationId}/receipts/delivered")->assertNoContent();
    $this->actingAs($bob)->postJson("/api/chat/conversations/{$conversationId}/receipts/read", [
        'up_to_message_id' => $messageId,
    ])->assertNoContent();

    $after = $this->actingAs($alice)->getJson("/api/chat/conversations/{$conversationId}/messages")->assertOk();
    $afterDetail = collect($after->json('data'))->firstWhere('id', $messageId)['receipt_details'][0];
    expect($afterDetail['chatable_id'])->toBe($bob->id)
        ->and($afterDetail['delivered_at'])->not->toBeNull()
        ->and($afterDetail['read_at'])->not->toBeNull();
});

it('never writes to the database when broadcasting a typing indicator', function () {
    $alice = presenceUser('alice-typing@example.com');
    $bob = presenceUser('bob-typing@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
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

it('suppresses the typing broadcast when the sender has disabled typing indicators', function () {
    $alice = presenceUser('alice-typingoff@example.com');
    $bob = presenceUser('bob-typingoff@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $this->actingAs($alice)->patchJson('/api/chat/profile/settings', [
        'show_typing_indicator' => false,
    ])->assertOk();

    Event::fake();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/typing", ['state' => 'start'])
        ->assertNoContent();

    Event::assertNotDispatched(UserTyping::class);
});

it('debounces presence heartbeat db writes and reports online status', function () {
    $alice = presenceUser('alice-presence@example.com');

    $this->actingAs($alice)->postJson('/api/chat/presence/heartbeat')->assertNoContent();

    $status = $this->actingAs($alice)->getJson("/api/chat/users/user/{$alice->id}/presence")->assertOk();
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

it('sweeps a stale heartbeat back to offline via the artisan command', function () {
    $alice = presenceUser('alice-sweep@example.com');

    $this->actingAs($alice)->postJson('/api/chat/presence/heartbeat')->assertNoContent();
    expect($this->actingAs($alice)->getJson("/api/chat/users/user/{$alice->id}/presence")->json('data.is_online'))->toBeTrue();

    // Past heartbeat_ttl_seconds + online_grace_seconds (60 + 90 default).
    $this->travel(151)->seconds();

    $this->artisan('chat:sweep-presence')->assertSuccessful();

    expect($this->actingAs($alice)->getJson("/api/chat/users/user/{$alice->id}/presence")->json('data.is_online'))->toBeFalse();
});

it('sweeps every stale row across chunk boundaries, not just the first 200', function () {
    // chunkById(200) advancing past a row it just flipped to is_online = false is exactly the
    // behavior that could silently drop rows if the chunking were wired wrong (e.g. ordering by
    // the wrong column, or re-including already-updated rows) — 201 rows forces at least two
    // chunks, so this only passes if every chunk actually gets processed.
    $rows = collect(range(1, 201))->map(fn ($i) => [
        'chatable_type' => 'user',
        'chatable_id' => 900000 + $i, // no matching user row on purpose — isolates the sweep/chunk
        'is_online' => true,          // mechanics from the unrelated per-chatable broadcast path.
        'last_seen_at' => now()->subDays(1),
        'created_at' => now(),
        'updated_at' => now(),
    ])->all();
    UserPresence::query()->insert($rows);

    DB::flushQueryLog();
    DB::enableQueryLog();
    $count = app(PresenceServiceInterface::class)->sweepStale();
    // A single get() would fetch all 201 rows in one SELECT regardless of correctness; two
    // chat_user_presence SELECTs (201 rows over a 200-row chunk size) is what actually proves
    // chunkById() is in effect rather than an unbounded fetch that just happens to still work.
    $selects = collect(DB::getQueryLog())->filter(
        fn ($entry) => str_contains($entry['query'], 'chat_user_presence') && str_starts_with(strtolower($entry['query']), 'select')
    );
    DB::disableQueryLog();

    expect($count)->toBe(201)
        ->and(UserPresence::query()->where('is_online', true)->count())->toBe(0)
        ->and($selects)->toHaveCount(2);
});
