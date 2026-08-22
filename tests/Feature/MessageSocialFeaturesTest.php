<?php

use Riwaaq\Chat\Tests\Fixtures\User;

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

it('only lets the sender delete for everyone within the configured window', function () {
    $alice = socialUser('alice-delwindow@example.com');
    $bob = socialUser('bob-delwindow@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $messageId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'oops'])
        ->json('data.id');

    // Past config('chat.message.delete_for_everyone_window_minutes') (5) — the sender can no
    // longer delete for everyone, only for themselves.
    $this->travel(6)->minutes();

    $this->actingAs($alice)->deleteJson("/api/chat/messages/{$messageId}")->assertForbidden();
    $this->actingAs($alice)->deleteJson("/api/chat/messages/{$messageId}/me")->assertNoContent();
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

it('rejects an edited body longer than the configured max length', function () {
    config(['chat.message.max_body_length' => 20]);

    $alice = socialUser('alice-edit-maxlen@example.com');
    $bob = socialUser('bob-edit-maxlen@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $messageId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'oops'])
        ->json('data.id');

    $this->actingAs($alice)
        ->patchJson("/api/chat/messages/{$messageId}", ['body' => str_repeat('x', 21)])
        ->assertInvalid(['body']);
});

it('records each previous body in edit history, visible to any participant', function () {
    $alice = socialUser('alice-edit-history@example.com');
    $bob = socialUser('bob-edit-history@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $messageId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'first draft'])
        ->json('data.id');

    $this->actingAs($alice)
        ->patchJson("/api/chat/messages/{$messageId}", ['body' => 'second draft'])
        ->assertOk();

    $this->actingAs($alice)
        ->patchJson("/api/chat/messages/{$messageId}", ['body' => 'final'])
        ->assertOk();

    // Bob never sent or edited it, but can still see what it used to say.
    $history = $this->actingAs($bob)
        ->getJson("/api/chat/messages/{$messageId}/edits")
        ->assertOk()
        ->json('data');

    expect($history)->toHaveCount(2);
    expect(collect($history)->pluck('previous_body')->all())->toBe(['second draft', 'first draft']);
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

    // The embedded conversation.participants shape must match ParticipantResource
    // (chatable_type/chatable_id) — the frontend's chatableKeyOf() reads those exact keys to
    // figure out who the "other" participant of a starred DM is.
    $participant = $starred->json('data.0.conversation.participants.0');
    expect($participant)->toHaveKeys(['chatable_type', 'chatable_id'])
        ->and($participant)->not->toHaveKey('type');

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

it('sets a conversation wallpaper for the requesting participant only, then resets it back to null', function () {
    $alice = socialUser('alice-wallpaper@example.com');
    $bob = socialUser('bob-wallpaper@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/wallpaper", ['wallpaper' => 'lines|info'])
        ->assertOk()
        ->assertJsonPath('data.me.wallpaper', 'lines|info');

    // Bob's own view of the same conversation is unaffected — wallpaper is per-participant, not
    // shared conversation state.
    $bobsView = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}")->assertOk();
    expect($bobsView->json('data.me.wallpaper'))->toBeNull();

    // The "Reset to default" action in the picker sends wallpaper: null — must actually clear the
    // column back to null (falls back to the client's own default wallpaper preference), not get
    // rejected or silently coerced to an empty string.
    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/wallpaper", ['wallpaper' => null])
        ->assertOk()
        ->assertJsonPath('data.me.wallpaper', null);
});

it('marks a conversation manually unread without disturbing read receipts, then clears it on mark-read', function () {
    $alice = socialUser('alice-unread@example.com');
    $bob = socialUser('bob-unread@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $messageId = $this->actingAs($bob)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'hi'])
        ->json('data.id');

    // Alice genuinely reads it — Bob's message now shows as read to Bob.
    $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/receipts/read", [
        'up_to_message_id' => $messageId,
    ])->assertNoContent();

    $bobsReadStatus = $this->actingAs($bob)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->json('data.0.status');
    expect($bobsReadStatus)->toBe('read');

    // Alice marks it unread again — purely cosmetic on her side.
    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/unread", ['unread' => true])
        ->assertOk()
        ->assertJsonPath('data.unread_count', 1);

    // Bob's read receipt must be untouched — marking unread never un-reads anything for Bob.
    $bobsReadStatusAfter = $this->actingAs($bob)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->json('data.0.status');
    expect($bobsReadStatusAfter)->toBe('read');

    // Opening the conversation again (the normal mark-read flow) clears the manual flag.
    $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/receipts/read", [
        'up_to_message_id' => $messageId,
    ])->assertNoContent();

    $this->actingAs($alice)
        ->getJson("/api/chat/conversations/{$conversationId}")
        ->assertJsonPath('data.unread_count', 0);
});

it('favourites a conversation independently of pinning it', function () {
    $alice = socialUser('alice-fav@example.com');
    $bob = socialUser('bob-fav@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/favourite", ['favourited' => true])
        ->assertOk()
        ->assertJsonPath('data.me.favourited_at', fn ($value) => $value !== null)
        ->assertJsonPath('data.me.pinned_at', fn ($value) => $value === null);

    $bobsView = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}")->assertOk();
    expect($bobsView->json('data.me.favourited_at'))->toBeNull();

    $this->actingAs($alice)
        ->patchJson("/api/chat/conversations/{$conversationId}/favourite", ['favourited' => false])
        ->assertOk()
        ->assertJsonPath('data.me.favourited_at', fn ($value) => $value === null);
});
