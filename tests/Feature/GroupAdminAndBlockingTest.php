<?php

use Riwaaq\Chat\Tests\Fixtures\User;

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

it('rejects an add-participants request with more than 200 participants', function () {
    $alice = groupUser('alice-toomany@example.com');
    $bob = groupUser('bob-toomany@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Too many',
        'participants' => chatableRefs([$bob]),
    ])->json('data.id');

    // Validation rejects on array size alone, before touching the DB, so these don't need to
    // be real users.
    $participants = collect(range(1, 201))->map(fn ($id) => ['type' => 'user', 'id' => $id])->all();

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", ['participants' => $participants])
        ->assertInvalid(['participants']);
});

it('rejects add-participants calls that would push total membership past 200, even split across separate requests', function () {
    // The per-request `max:200` rule only bounds a single call's array size — it never looks at
    // how many participants the conversation already has. Two calls that each stay under 200 on
    // their own could previously add up to well past it. This proves ParticipantService itself
    // now tracks the running total and rejects (atomically — no partial add) once it would.
    $alice = groupUser('alice-splitcap@example.com');
    $bob = groupUser('bob-splitcap@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Split cap',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');
    // alice + bob = 2 active participants so far.

    $password = bcrypt('secret');
    $makeUsers = function (int $count, string $prefix) use ($password) {
        $now = now();
        User::query()->insert(collect(range(1, $count))->map(fn ($i) => [
            'name' => "{$prefix}{$i}",
            'email' => "{$prefix}{$i}@example.com",
            'password' => $password,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all());

        return User::query()->where('email', 'like', "{$prefix}%@example.com")->get();
    };

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", [
            'participants' => chatableRefs($makeUsers(150, 'splitcap-a-')),
        ])
        ->assertOk();
    // 2 + 150 = 152 active participants — still under the cap.

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/participants", [
            'participants' => chatableRefs($makeUsers(60, 'splitcap-b-')),
        ])
        ->assertStatus(422);
    // 152 + 60 = 212 > 200 — rejected, even though 60 alone is well under the per-request cap.

    $participants = $this->actingAs($alice)
        ->getJson("/api/chat/conversations/{$conversationId}/participants")
        ->assertOk();

    expect($participants->json('data'))->toHaveCount(152);
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
