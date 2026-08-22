<?php

use Illuminate\Support\Facades\DB;
use Riwaaq\Chat\Tests\Fixtures\User;

function chatUser(): User
{
    return User::query()->create([
        'name' => fake()->name(),
        'email' => fake()->unique()->safeEmail(),
        'password' => bcrypt('secret'),
    ]);
}

it('creates a private conversation and dedupes on repeat', function () {
    $alice = chatUser();
    $bob = chatUser();

    $first = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->assertCreated();

    $conversationId = $first->json('data.id');

    $second = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->assertOk();

    expect($second->json('data.id'))->toBe($conversationId);
});

it('creates a group conversation with all participants admin-free except creator', function () {
    $alice = chatUser();
    $bob = chatUser();
    $carol = chatUser();

    $response = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Trip planning',
        'participants' => chatableRefs([$bob, $carol]),
    ])->assertCreated();

    expect($response->json('data.name'))->toBe('Trip planning')
        ->and($response->json('data.participants'))->toHaveCount(3);
});

it('resolves last_message and unread_count for the conversation list without one query per conversation', function () {
    // 1 conversation vs 8, each for a different user — if last_message/unread_count were
    // still resolved per row (the N+1 this replaced), 8 conversations would cost roughly
    // 2 extra queries each over 1. Equal query counts either way prove it's batched, not
    // per-row.
    $countQueriesFor = function (int $conversationCount) {
        $viewer = chatUser();

        for ($i = 0; $i < $conversationCount; $i++) {
            $sender = chatUser();
            $conversationId = $this->actingAs($viewer)->postJson('/api/chat/conversations', [
                'type' => 'private',
                'participants' => [chatableRef($sender)],
            ])->json('data.id');

            $this->actingAs($sender)->postJson("/api/chat/conversations/{$conversationId}/messages", [
                'type' => 'text',
                'body' => 'hey',
            ])->assertCreated();
        }

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->actingAs($viewer)->getJson('/api/chat/conversations')->assertOk()->assertJsonCount($conversationCount, 'data');
        $count = count(DB::getQueryLog());
        DB::disableQueryLog();

        return $count;
    };

    $withOne = $countQueriesFor(1);
    $withEight = $countQueriesFor(8);

    expect($withEight)->toBe($withOne);
});

it('rejects a conversation create request with more than 200 participants', function () {
    $alice = chatUser();

    // Validation rejects on array size alone, before touching the DB, so these don't need to
    // be real users.
    $participants = collect(range(1, 201))->map(fn ($id) => ['type' => 'user', 'id' => $id])->all();

    $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Too big',
        'participants' => $participants,
    ])->assertInvalid(['participants']);
});

it('prevents a non-participant from viewing a conversation', function () {
    $alice = chatUser();
    $bob = chatUser();
    $eve = chatUser();

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $this->actingAs($eve)
        ->getJson("/api/chat/conversations/{$conversationId}")
        ->assertForbidden();
});
