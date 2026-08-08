<?php

use Converse\Chat\Tests\Fixtures\User;

function socialUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

function privateConversationBetween(User $a, User $b): int
{
    return test()->actingAs($a)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($b)],
    ])->json('data.id');
}

it('toggles a reaction on and off', function () {
    $alice = socialUser('alice-react@example.com');
    $bob = socialUser('bob-react@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $messageId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'hi'])
        ->json('data.id');

    $reacted = $this->actingAs($bob)
        ->postJson("/api/chat/messages/{$messageId}/reactions", ['emoji' => '👍'])
        ->assertOk();

    expect($reacted->json('data.0.emoji'))->toBe('👍')
        ->and($reacted->json('data.0.count'))->toBe(1);

    $removed = $this->actingAs($bob)
        ->deleteJson("/api/chat/messages/{$messageId}/reactions")
        ->assertOk();

    expect($removed->json('data'))->toBe([]);
});

it('replies to a message and forwards it to another conversation', function () {
    $alice = socialUser('alice-fwd@example.com');
    $bob = socialUser('bob-fwd@example.com');
    $carol = socialUser('carol-fwd@example.com');

    $convoAB = privateConversationBetween($alice, $bob);
    $convoAC = privateConversationBetween($alice, $carol);

    $originalId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$convoAB}/messages", ['type' => 'text', 'body' => 'original'])
        ->json('data.id');

    $reply = $this->actingAs($bob)->postJson("/api/chat/conversations/{$convoAB}/messages", [
        'type' => 'text',
        'body' => 'replying',
        'reply_to_message_id' => $originalId,
    ])->assertCreated();

    expect($reply->json('data.reply_to.body'))->toBe('original');

    $forwarded = $this->actingAs($alice)
        ->postJson("/api/chat/messages/{$originalId}/forward", ['conversation_ids' => [$convoAC]])
        ->assertOk();

    expect($forwarded->json('data.0.is_forwarded'))->toBeTrue()
        ->and($forwarded->json('data.0.body'))->toBe('original');
});

it('deletes a message for me without affecting the other participant, and for everyone globally', function () {
    $alice = socialUser('alice-del@example.com');
    $bob = socialUser('bob-del@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $messageId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'secret'])
        ->json('data.id');

    $this->actingAs($bob)->deleteJson("/api/chat/messages/{$messageId}/me")->assertNoContent();

    $bobsList = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}/messages")->assertOk();
    expect($bobsList->json('data'))->toHaveCount(0);

    $alicesList = $this->actingAs($alice)->getJson("/api/chat/conversations/{$conversationId}/messages")->assertOk();
    expect($alicesList->json('data'))->toHaveCount(1);

    $this->actingAs($alice)->deleteJson("/api/chat/messages/{$messageId}")->assertNoContent();

    $alicesListAfter = $this->actingAs($alice)->getJson("/api/chat/conversations/{$conversationId}/messages")->assertOk();
    expect($alicesListAfter->json('data.0.body'))->toBeNull()
        ->and($alicesListAfter->json('data.0.deleted_for_everyone'))->toBeTrue();
});

it('edits a message body within the edit window', function () {
    $alice = socialUser('alice-edit@example.com');
    $bob = socialUser('bob-edit@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $messageId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'oops'])
        ->json('data.id');

    $this->actingAs($alice)
        ->patchJson("/api/chat/messages/{$messageId}", ['body' => 'fixed'])
        ->assertOk()
        ->assertJsonPath('data.body', 'fixed');

    $this->actingAs($bob)
        ->patchJson("/api/chat/messages/{$messageId}", ['body' => 'hijacked'])
        ->assertForbidden();
});

it('stars and unstars a message', function () {
    $alice = socialUser('alice-star@example.com');
    $bob = socialUser('bob-star@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $messageId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'important'])
        ->json('data.id');

    $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/star")->assertNoContent();

    $starred = $this->actingAs($bob)->getJson('/api/chat/starred-messages')->assertOk();
    expect($starred->json('data'))->toHaveCount(1);

    $this->actingAs($bob)->deleteJson("/api/chat/messages/{$messageId}/star")->assertNoContent();

    $starredAfter = $this->actingAs($bob)->getJson('/api/chat/starred-messages')->assertOk();
    expect($starredAfter->json('data'))->toHaveCount(0);
});

it('mutes, archives, and pins a conversation for the requesting participant only', function () {
    $alice = socialUser('alice-flags@example.com');
    $bob = socialUser('bob-flags@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $muted = $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/mute", ['muted_until' => now()->addHour()->toIso8601String()])
        ->assertOk();
    expect($muted->json('data.me.muted_until'))->not->toBeNull();

    $bobsView = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}")->assertOk();
    expect($bobsView->json('data.me.muted_until'))->toBeNull();

    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/archive", ['archived' => true])
        ->assertOk()
        ->assertJsonPath('data.me.archived_at', fn ($value) => $value !== null);

    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/pin", ['pinned' => true])
        ->assertOk()
        ->assertJsonPath('data.me.pinned_at', fn ($value) => $value !== null);
});
