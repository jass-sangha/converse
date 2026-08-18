<?php

use Converse\Chat\Models\License;
use Converse\Chat\Models\Message;
use Converse\Chat\Tests\Fixtures\User;

function licenseTestUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('blocks adding a participant past the free plan group limit but allows it on paid', function () {
    $alice = licenseTestUser('alice-license@example.com');
    $bob = licenseTestUser('bob-license@example.com');
    $carol = licenseTestUser('carol-license@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->assertCreated()->json('data.id');

    // No license row exists yet — LicenseService defaults a fresh install to the free plan
    // (max_group_participants = 2), so a 3rd participant is blocked, not a hard 500/blank error.
    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", ['participants' => [chatableRef($carol)]])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('participants');

    License::query()->create(['plan' => 'paid']);

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", ['participants' => [chatableRef($carol)]])
        ->assertOk();
});

it('blocks creating a group past the free plan participant limit but allows it on paid', function () {
    $alice = licenseTestUser('alice-group-license@example.com');
    $bob = licenseTestUser('bob-group-license@example.com');
    $carol = licenseTestUser('carol-group-license@example.com');

    $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Too Big For Free',
        'participants' => chatableRefs([$bob, $carol]),
    ])->assertUnprocessable()->assertJsonValidationErrors('participants');

    License::query()->create(['plan' => 'paid']);

    $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Fine On Paid',
        'participants' => chatableRefs([$bob, $carol]),
    ])->assertCreated();
});

it('hides messages older than the free plan history window but shows them on paid', function () {
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

    // Free plan default history_days = 30: the old message is hidden, not deleted.
    $freeMessages = $this->actingAs($alice)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertOk();

    expect(collect($freeMessages->json('data'))->pluck('id'))
        ->toContain($recentId)
        ->not->toContain($oldId);

    expect(Message::query()->where('id', $oldId)->exists())->toBeTrue();

    License::query()->create(['plan' => 'paid']);

    // Paid plan (unlimited history): the same, never-deleted message is now visible again.
    $paidMessages = $this->actingAs($alice)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertOk();

    expect(collect($paidMessages->json('data'))->pluck('id'))->toContain($recentId, $oldId);
});

it('reflects the branding flag based on the current license plan', function () {
    $user = licenseTestUser('branding-license@example.com');

    $this->actingAs($user)->get('/converse/chat')
        ->assertOk()
        ->assertSee('"showBranding":true', false);

    License::query()->create(['plan' => 'paid']);

    $this->actingAs($user)->get('/converse/chat')
        ->assertOk()
        ->assertSee('"showBranding":false', false);
});
