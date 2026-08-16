<?php

use Converse\Chat\Tests\Fixtures\User;

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
