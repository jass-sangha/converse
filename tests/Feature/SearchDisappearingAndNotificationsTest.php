<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Notifications\NewChatMessageNotification;
use Riwaaq\Chat\Tests\Fixtures\User;

function m6User(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('searches messages scoped to conversations the user participates in', function () {
    $alice = m6User('alice-search@example.com');
    $bob = m6User('bob-search@example.com');
    $eve = m6User('eve-search@example.com');

    $convoAB = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $convoAE = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($eve)],
    ])->json('data.id');

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$convoAB}/messages", [
        'type' => 'text', 'body' => 'let us meet at the pizzeria tonight',
    ])->assertCreated();

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$convoAE}/messages", [
        'type' => 'text', 'body' => 'completely unrelated topic',
    ])->assertCreated();

    $results = $this->actingAs($bob)->getJson('/api/chat/messages/search?q=pizzeria')->assertOk();

    expect($results->json('data'))->toHaveCount(1)
        ->and($results->json('data.0.body'))->toContain('pizzeria');

    // Bob is not a participant of convoAE — searching cannot surface it even with a matching term.
    $crossConvoLeak = $this->actingAs($bob)->getJson('/api/chat/messages/search?q=unrelated')->assertOk();
    expect($crossConvoLeak->json('data'))->toHaveCount(0);
});

it('prunes disappearing messages once their ttl has elapsed', function () {
    $alice = m6User('alice-disappear@example.com');
    $bob = m6User('bob-disappear@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/disappearing", ['ttl_seconds' => 60])
        ->assertOk();

    $messageId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'vanish soon'])
        ->json('data.id');

    expect(Message::query()->find($messageId)->expires_at)->not->toBeNull();

    // Simulate elapsed TTL without waiting real time.
    Message::query()->whereKey($messageId)->update(['expires_at' => now()->subMinute()]);

    Artisan::call('chat:prune-expired-messages');

    expect(Message::query()->find($messageId))->toBeNull();

    $list = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}/messages")->assertOk();
    expect(collect($list->json('data'))->pluck('id'))->not->toContain($messageId);
});

it('notifies other participants when a message is sent', function () {
    Notification::fake();

    $alice = m6User('alice-notify@example.com');
    $bob = m6User('bob-notify@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'ping'])
        ->assertCreated();

    Notification::assertSentTo($bob, NewChatMessageNotification::class);
    Notification::assertNotSentTo($alice, NewChatMessageNotification::class);
});

it('hides archived conversations from the default list and includes them when requested', function () {
    $alice = m6User('alice-archivelist@example.com');
    $bob = m6User('bob-archivelist@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $this->actingAs($alice)->patchJson("/api/chat/conversations/{$conversationId}/archive", ['archived' => true])->assertOk();

    $defaultList = $this->actingAs($alice)->getJson('/api/chat/conversations')->assertOk();
    expect(collect($defaultList->json('data'))->pluck('id'))->not->toContain($conversationId);

    $archivedList = $this->actingAs($alice)->getJson('/api/chat/conversations?archived=1')->assertOk();
    expect(collect($archivedList->json('data'))->pluck('id'))->toContain($conversationId);
});
