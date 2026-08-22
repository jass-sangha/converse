<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Riwaaq\Chat\Events\CallSignal;
use Riwaaq\Chat\Tests\Fixtures\User;

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

it('relays a targeted call signal to only the specified recipient, for a group call mesh', function () {
    $alice = callSignalUser('alice-call-3@example.com');
    $bob = callSignalUser('bob-call-3@example.com');
    $carol = callSignalUser('carol-call-3@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Call mesh group',
        'participants' => chatableRefs([$bob, $carol]),
    ])->json('data.id');

    Event::fake();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/call/signal", [
            'payload' => ['kind' => 'offer', 'sdp' => 'v=0...'],
            'to_type' => $bob->getMorphClass(),
            'to_id' => $bob->getKey(),
        ])
        ->assertNoContent();

    Event::assertDispatched(CallSignal::class, function (CallSignal $event) use ($conversationId, $bob, $carol) {
        return $event->conversationId === $conversationId
            && $event->recipientChannels === ["chatable.{$bob->getMorphClass()}.{$bob->getKey()}"]
            && ! in_array("chatable.{$carol->getMorphClass()}.{$carol->getKey()}", $event->recipientChannels, true);
    });
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

it('rejects a call signal payload larger than the configured byte limit', function () {
    // A real SDP offer/answer or ICE candidate is a few KB at most — nothing previously bounded
    // 'payload' beyond "must be an array", so an arbitrarily large nested structure would get
    // broadcast to another participant's channel on every call.
    $alice = callSignalUser('alice-call-3@example.com');
    $bob = callSignalUser('bob-call-3@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $oversized = ['sdp' => str_repeat('x', config('chat.calls.max_payload_bytes', 65536) + 1)];

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/call/signal", ['payload' => $oversized])
        ->assertInvalid(['payload']);

    // A payload right at the limit still goes through.
    $atLimit = ['sdp' => str_repeat('x', config('chat.calls.max_payload_bytes', 65536) - 20)];

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/call/signal", ['payload' => $atLimit])
        ->assertNoContent();
});
