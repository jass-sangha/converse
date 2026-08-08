<?php

use Converse\Chat\Tests\Fixtures\User;

function groupUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('lets the group admin add and remove members but rejects a non-admin', function () {
    $alice = groupUser('alice-grp@example.com');
    $bob = groupUser('bob-grp@example.com');
    $carol = groupUser('carol-grp@example.com');
    $dave = groupUser('dave-grp@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Admins Only',
        'participant_ids' => [$bob->id, $carol->id],
    ])->json('data.id');

    $this->actingAs($bob)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", ['user_ids' => [$dave->id]])
        ->assertForbidden();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", ['user_ids' => [$dave->id]])
        ->assertOk();

    $this->actingAs($bob)
        ->deleteJson("/api/chat/conversations/{$conversationId}/participants/{$carol->id}")
        ->assertForbidden();

    $this->actingAs($alice)
        ->deleteJson("/api/chat/conversations/{$conversationId}/participants/{$carol->id}")
        ->assertNoContent();

    $participants = $this->actingAs($alice)
        ->getJson("/api/chat/conversations/{$conversationId}/participants")
        ->assertOk();

    expect(collect($participants->json('data'))->pluck('user_id'))
        ->toContain($bob->id, $dave->id)
        ->not->toContain($carol->id);
});

it('prevents the sole admin from demoting themselves or leaving without promoting someone else', function () {
    $alice = groupUser('alice-sole@example.com');
    $bob = groupUser('bob-sole@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Solo Admin',
        'participant_ids' => [$bob->id],
    ])->json('data.id');

    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/participants/{$alice->id}/role", ['role' => 'member'])
        ->assertUnprocessable();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/leave")
        ->assertUnprocessable();

    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/participants/{$bob->id}/role", ['role' => 'admin'])
        ->assertNoContent();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/leave")
        ->assertNoContent();
});

it('prevents blocked users from messaging each other in a private conversation', function () {
    $alice = groupUser('alice-block@example.com');
    $bob = groupUser('bob-block@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participant_ids' => [$bob->id],
    ])->json('data.id');

    $this->actingAs($alice)->postJson('/api/chat/blocked-users', ['user_id' => $bob->id])->assertNoContent();

    $this->actingAs($bob)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'hi'])
        ->assertForbidden();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'hi'])
        ->assertForbidden();

    $this->actingAs($alice)->deleteJson("/api/chat/blocked-users/{$bob->id}")->assertNoContent();

    $this->actingAs($bob)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'unblocked now'])
        ->assertCreated();
});
