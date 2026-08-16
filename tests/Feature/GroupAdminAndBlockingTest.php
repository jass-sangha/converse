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
        'participants' => chatableRefs([$bob, $carol]),
    ])->json('data.id');

    $this->actingAs($bob)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", ['participants' => [chatableRef($dave)]])
        ->assertForbidden();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", ['participants' => [chatableRef($dave)]])
        ->assertOk();

    $this->actingAs($bob)
        ->deleteJson("/api/chat/conversations/{$conversationId}/participants/user/{$carol->id}")
        ->assertForbidden();

    $this->actingAs($alice)
        ->deleteJson("/api/chat/conversations/{$conversationId}/participants/user/{$carol->id}")
        ->assertOk()
        ->assertJsonPath('message.metadata.event', 'participant_removed');

    $participants = $this->actingAs($alice)
        ->getJson("/api/chat/conversations/{$conversationId}/participants")
        ->assertOk();

    expect(collect($participants->json('data'))->pluck('chatable_id'))
        ->toContain($bob->id, $dave->id)
        ->not->toContain($carol->id);
});

it('prevents the sole admin from demoting themselves or leaving without promoting someone else', function () {
    $alice = groupUser('alice-sole@example.com');
    $bob = groupUser('bob-sole@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Solo Admin',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/participants/user/{$alice->id}/role", ['role' => 'member'])
        ->assertUnprocessable();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/leave")
        ->assertUnprocessable();

    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/participants/user/{$bob->id}/role", ['role' => 'admin'])
        ->assertOk()
        ->assertJsonPath('message.metadata.event', 'participant_role_changed');

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/leave")
        ->assertNoContent();
});

it('prevents blocked users from messaging each other in a private conversation', function () {
    $alice = groupUser('alice-block@example.com');
    $bob = groupUser('bob-block@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $this->actingAs($alice)->postJson('/api/chat/blocked-users', [
        'chatable_type' => 'user',
        'chatable_id' => $bob->id,
    ])->assertNoContent();

    $this->actingAs($bob)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'hi'])
        ->assertForbidden();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'hi'])
        ->assertForbidden();

    $this->actingAs($alice)->deleteJson("/api/chat/blocked-users/user/{$bob->id}")->assertNoContent();

    $this->actingAs($bob)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'unblocked now'])
        ->assertCreated();
});
