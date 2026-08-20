<?php

use Riwaaq\Chat\Tests\Fixtures\User;

function privacyUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('hides last seen and read receipts for a set duration, then reverts automatically', function () {
    $alice = privacyUser('alice-privacydur@example.com');

    $hiddenUntil = now()->addHours(8)->toIso8601String();

    $updated = $this->actingAs($alice)->patchJson('/api/chat/profile/settings', [
        'show_last_seen' => true,
        'last_seen_hidden_until' => $hiddenUntil,
        'show_read_receipts' => true,
        'read_receipts_hidden_until' => $hiddenUntil,
        'show_typing_indicator' => true,
        'typing_indicator_hidden_until' => $hiddenUntil,
    ])->assertOk();

    // Effective visibility is false while inside the hidden window, even though the
    // underlying "show" flag is true — the timestamp is what's actually hiding it.
    expect($updated->json('data.show_last_seen'))->toBeFalse()
        ->and($updated->json('data.show_read_receipts'))->toBeFalse()
        ->and($updated->json('data.show_typing_indicator'))->toBeFalse();

    $this->travel(9)->hours();

    $afterExpiry = $this->actingAs($alice)->getJson('/api/chat/profile/settings')->assertOk();
    expect($afterExpiry->json('data.show_last_seen'))->toBeTrue()
        ->and($afterExpiry->json('data.show_read_receipts'))->toBeTrue()
        ->and($afterExpiry->json('data.show_typing_indicator'))->toBeTrue();

    // Without this, the traveled clock leaks into whichever test runs next in the same
    // process — $this->travel() mutates Carbon's global test-now, not a per-test sandbox.
    $this->travelBack();
});

it('re-enables last seen and read receipts immediately via the off action', function () {
    $alice = privacyUser('alice-privacyoff@example.com');

    $this->actingAs($alice)->patchJson('/api/chat/profile/settings', [
        'show_last_seen' => true,
        'last_seen_hidden_until' => now()->addDays(7)->toIso8601String(),
    ])->assertOk();

    $reenabled = $this->actingAs($alice)->patchJson('/api/chat/profile/settings', [
        'show_last_seen' => true,
        'last_seen_hidden_until' => null,
    ])->assertOk();

    expect($reenabled->json('data.show_last_seen'))->toBeTrue()
        ->and($reenabled->json('data.last_seen_hidden_until'))->toBeNull();
});

it('hides last-seen presence from other participants while inside the hidden window', function () {
    $alice = privacyUser('alice-privacypresence@example.com');
    $bob = privacyUser('bob-privacypresence@example.com');

    $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->assertCreated();

    $this->actingAs($alice)->postJson('/api/chat/presence/heartbeat')->assertSuccessful();

    $this->actingAs($alice)->patchJson('/api/chat/profile/settings', [
        'show_last_seen' => true,
        'last_seen_hidden_until' => now()->addHours(8)->toIso8601String(),
    ])->assertOk();

    $presence = $this->actingAs($bob)->getJson('/api/chat/users/user/'.$alice->id.'/presence')->assertOk();

    expect($presence->json('data.last_seen_at'))->toBeNull();
});
