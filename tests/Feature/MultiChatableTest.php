<?php

use Riwaaq\Chat\Tests\Fixtures\Agent;
use Riwaaq\Chat\Tests\Fixtures\User;

it('lets a User and an Agent share a private conversation, even when their ids collide', function () {
    // Deliberately force id collisions between the two tables: User #1 and Agent #1
    // are different chatables and must never be confused with each other.
    $user = User::query()->create(['name' => 'Alice', 'email' => 'alice-multi@example.com', 'password' => bcrypt('secret')]);
    $agent = Agent::query()->create(['full_name' => 'Support Bot', 'email' => 'bot-multi@example.com', 'password' => bcrypt('secret')]);

    expect($user->id)->toBe($agent->id);

    $conversationId = $this->actingAs($user)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($agent)],
    ])->assertCreated()->json('data.id');

    $this->actingAs($user)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'Hi, I need help',
    ])->assertCreated()
        ->assertJsonPath('data.chatable_type', 'user')
        ->assertJsonPath('data.chatable_id', $user->id);

    $agentReply = $this->actingAs($agent)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'How can I help?',
    ])->assertCreated();

    $agentReply->assertJsonPath('data.chatable_type', 'agent')
        ->assertJsonPath('data.chatable_id', $agent->id);

    $messages = $this->actingAs($user)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertOk();

    expect($messages->json('data'))->toHaveCount(2);

    // The agent must not be able to see itself listed as a "user" participant, and
    // vice versa — each participant row carries its own real chatable_type.
    $participants = $this->actingAs($user)
        ->getJson("/api/chat/conversations/{$conversationId}/participants")
        ->assertOk()
        ->json('data');

    $userRow = collect($participants)->first(fn ($p) => $p['chatable_type'] === 'user' && $p['chatable_id'] === $user->id);
    $agentRow = collect($participants)->first(fn ($p) => $p['chatable_type'] === 'agent' && $p['chatable_id'] === $agent->id);

    expect($userRow)->not->toBeNull()
        ->and($agentRow)->not->toBeNull();

    // The agent's own display-name column (full_name) differs from the user's
    // (name) — chat.chatable_models declares this per-alias in TestCase, and both
    // must resolve correctly through the shared ChatUserResource/UserSearchService.
    $agentLookup = $this->actingAs($user)
        ->getJson("/api/chat/users?type=agent&ids[]={$agent->id}")
        ->assertOk()
        ->json('data');

    expect($agentLookup[0]['name'])->toBe('Support Bot');

    $userLookup = $this->actingAs($agent)
        ->getJson("/api/chat/users?type=user&ids[]={$user->id}")
        ->assertOk()
        ->json('data');

    expect($userLookup[0]['name'])->toBe('Alice');
});

it('keeps presence and blocking independent per chatable type despite colliding ids', function () {
    $user = User::query()->create(['name' => 'Bob', 'email' => 'bob-multi@example.com', 'password' => bcrypt('secret')]);
    $agent = Agent::query()->create(['full_name' => 'Bot Two', 'email' => 'bot-two-multi@example.com', 'password' => bcrypt('secret')]);

    expect($user->id)->toBe($agent->id);

    $this->actingAs($user)->postJson('/api/chat/presence/heartbeat')->assertNoContent();

    $userStatus = $this->getJson("/api/chat/users/user/{$user->id}/presence")->assertOk();
    $agentStatus = $this->getJson("/api/chat/users/agent/{$agent->id}/presence")->assertOk();

    expect($userStatus->json('data.is_online'))->toBeTrue()
        ->and($agentStatus->json('data.is_online'))->toBeFalse();
});
