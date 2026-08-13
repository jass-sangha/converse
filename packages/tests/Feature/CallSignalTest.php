<?php

use Converse\Chat\Events\CallSignal;
use Converse\Chat\Tests\Fixtures\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

function callSignalUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('relays a call signal to the conversation channel without writing to the database', function () {
    $alice = callSignalUser('alice-call@example.com');
    $bob = callSignalUser('bob-call@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    Event::fake();
    DB::enableQueryLog();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/call/signal", [
            'payload' => ['type' => 'offer', 'sdp' => 'v=0...'],
        ])
        ->assertNoContent();

    $writes = collect(DB::getQueryLog())->filter(
        fn ($entry) => str_starts_with(strtolower($entry['query']), 'insert')
            || str_starts_with(strtolower($entry['query']), 'update')
            || str_starts_with(strtolower($entry['query']), 'delete')
    );

    expect($writes)->toHaveCount(0);

    Event::assertDispatched(CallSignal::class, function (CallSignal $event) use ($conversationId) {
        return $event->conversationId === $conversationId
            && $event->payload === ['type' => 'offer', 'sdp' => 'v=0...'];
    });

    DB::disableQueryLog();
});

it('refuses to relay a call signal for a non-participant', function () {
    $alice = callSignalUser('alice-call-2@example.com');
    $bob = callSignalUser('bob-call-2@example.com');
    $eve = callSignalUser('eve-call-2@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $this->actingAs($eve)
        ->postJson("/api/chat/conversations/{$conversationId}/call/signal", [
            'payload' => ['type' => 'offer', 'sdp' => 'v=0...'],
        ])
        ->assertForbidden();
});
