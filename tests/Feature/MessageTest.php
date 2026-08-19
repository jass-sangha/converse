<?php

use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Tests\Fixtures\User;

function createPrivateConversation(User $a, User $b): int
{
    return test()->actingAs($a)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($b)],
    ])->json('data.id');
}

it('sends and lists text messages in a conversation', function () {
    $alice = User::query()->create(['name' => 'Alice', 'email' => 'alice@example.com', 'password' => bcrypt('secret')]);
    $bob = User::query()->create(['name' => 'Bob', 'email' => 'bob@example.com', 'password' => bcrypt('secret')]);

    $conversationId = createPrivateConversation($alice, $bob);

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'Hey Bob!',
    ])->assertCreated()
        ->assertJsonPath('data.body', 'Hey Bob!')
        ->assertJsonPath('data.status', 'sent');

    $messages = $this->actingAs($bob)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertOk();

    expect($messages->json('data'))->toHaveCount(1)
        ->and($messages->json('data.0.body'))->toBe('Hey Bob!');
});

it('rejects a non-participant from reading messages in a conversation', function () {
    $alice = User::query()->create(['name' => 'Alice', 'email' => 'alice2@example.com', 'password' => bcrypt('secret')]);
    $bob = User::query()->create(['name' => 'Bob', 'email' => 'bob2@example.com', 'password' => bcrypt('secret')]);
    $eve = User::query()->create(['name' => 'Eve', 'email' => 'eve@example.com', 'password' => bcrypt('secret')]);

    $conversationId = createPrivateConversation($alice, $bob);

    $this->actingAs($eve)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertForbidden();

    $this->actingAs($eve)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'hi'])
        ->assertForbidden();
});

it('does not limit message history by age', function () {
    $alice = User::query()->create(['name' => 'Alice', 'email' => 'alice-history@example.com', 'password' => bcrypt('secret')]);
    $bob = User::query()->create(['name' => 'Bob', 'email' => 'bob-history@example.com', 'password' => bcrypt('secret')]);

    $conversationId = createPrivateConversation($alice, $bob);

    $recentId = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'recent',
    ])->assertCreated()->json('data.id');

    $oldId = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'old',
    ])->assertCreated()->json('data.id');

    Message::query()->where('id', $oldId)->update(['created_at' => now()->subDays(45)]);

    $messages = $this->actingAs($alice)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertOk();

    expect(collect($messages->json('data'))->pluck('id'))
        ->toContain($recentId)
        ->toContain($oldId);
});
