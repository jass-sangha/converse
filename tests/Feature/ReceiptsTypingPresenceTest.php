<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Riwaaq\Chat\Events\UserTyping;
use Riwaaq\Chat\Models\ConversationParticipant;
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

    // Every message now has a *read* receipt from each of bob/carol/dave (5 messages x 3
    // receipts = 15 rows), all pointing at only 3 distinct users. receiptStatus() only calls
    // allowsReadReceipts() on a receipt's chatable once that receipt is actually read (an
    // undelivered/unread receipt short-circuits before reaching it), so without memoization
    // this would be up to 15 separate chat_user_settings lookups for the same 3 users.
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
