<?php

use Converse\Chat\Models\Message;
use Converse\Chat\Tests\Fixtures\User;

function licenseTestUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('blocks adding a participant past the free-tier group limit but respects a raised config limit', function () {
    $alice = licenseTestUser('alice-license@example.com');
    $bob = licenseTestUser('bob-license@example.com');
    $carol = licenseTestUser('carol-license@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->assertCreated()->json('data.id');

    // Free-tier config (max_group_participants = 2): a 3rd participant is blocked
    // with a structured validation error, not a hard 500/blank failure.
    config(['converse.max_group_participants' => 2]);

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", ['participants' => [chatableRef($carol)]])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('participants');

    // No converse-pro installed here, so this exercises ConverseLimits' config fallback path —
    // the same path a host raising its own limit (or converse-pro overriding it) both go through.
    config(['converse.max_group_participants' => null]);

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", ['participants' => [chatableRef($carol)]])
        ->assertOk();
});

it('blocks creating a group past the free-tier participant limit but respects a raised config limit', function () {
    $alice = licenseTestUser('alice-group-license@example.com');
    $bob = licenseTestUser('bob-group-license@example.com');
    $carol = licenseTestUser('carol-group-license@example.com');

    // Free-tier config (max_group_participants = 2): a 3-participant group is blocked.
    config(['converse.max_group_participants' => 2]);

    $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Too Big For Free',
        'participants' => chatableRefs([$bob, $carol]),
    ])->assertUnprocessable()->assertJsonValidationErrors('participants');

    config(['converse.max_group_participants' => null]);

    $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Fine With A Higher Limit',
        'participants' => chatableRefs([$bob, $carol]),
    ])->assertCreated();
});

it('hides messages older than the free-tier history window but respects an unlimited config value', function () {
    $alice = licenseTestUser('alice-history@example.com');
    $bob = licenseTestUser('bob-history@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $recentId = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'recent',
    ])->assertCreated()->json('data.id');

    $oldId = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'old',
    ])->assertCreated()->json('data.id');

    Message::query()->where('id', $oldId)->update(['created_at' => now()->subDays(45)]);

    // Default free-tier config (history_days = 30): the old message is hidden, not deleted.
    $limited = $this->actingAs($alice)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertOk();

    expect(collect($limited->json('data'))->pluck('id'))
        ->toContain($recentId)
        ->not->toContain($oldId);

    expect(Message::query()->where('id', $oldId)->exists())->toBeTrue();

    config(['converse.history_days' => null]);

    // Unlimited history: the same, never-deleted message is visible again.
    $unlimited = $this->actingAs($alice)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertOk();

    expect(collect($unlimited->json('data'))->pluck('id'))->toContain($recentId, $oldId);
});

it('reflects the show_branding config value in the widget bootstrap payload', function () {
    $user = licenseTestUser('branding-license@example.com');

    $this->actingAs($user)->get('/converse/chat')
        ->assertOk()
        ->assertSee('"showBranding":true', false);

    config(['converse.show_branding' => false]);

    $this->actingAs($user)->get('/converse/chat')
        ->assertOk()
        ->assertSee('"showBranding":false', false);
});
