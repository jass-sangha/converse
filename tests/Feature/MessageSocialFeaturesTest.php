<?php

use Illuminate\Support\Facades\DB;
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

it('rejects replying to a message that belongs to a different conversation', function () {
    // StoreMessageRequest only validates reply_to_message_id as an integer, so this must be
    // enforced server-side: MessageResource's replyTo block exposes the referenced message's
    // body excerpt, metadata, and attachments, so accepting a cross-conversation id would leak
    // content from a conversation the poster (or, worse, its other participants reading the
    // reply) was never part of.
    $alice = socialUser('alice-replyleak@example.com');
    $bob = socialUser('bob-replyleak@example.com');
    $eve = socialUser('eve-replyleak@example.com');

    $convoAB = privateConversationBetween($alice, $bob);
    $convoAE = privateConversationBetween($alice, $eve);

    $secretId = $this->actingAs($bob)
        ->postJson("/api/chat/conversations/{$convoAB}/messages", ['type' => 'text', 'body' => 'secret between alice and bob'])
        ->json('data.id');

    $response = $this->actingAs($alice)->postJson("/api/chat/conversations/{$convoAE}/messages", [
        'type' => 'text',
        'body' => 'trying to leak',
        'reply_to_message_id' => $secretId,
    ])->assertStatus(422);

    expect($response->json('message'))->toContain('does not belong to this conversation');

    // Eve must never see the secret message's content, whether via the rejected message's own
    // (never-created) reply_to or by fetching the conversation afterward.
    $messages = $this->actingAs($eve)->getJson("/api/chat/conversations/{$convoAE}/messages")->assertOk();
    expect(collect($messages->json('data'))->pluck('body'))->not->toContain('secret between alice and bob');
});

it('keeps earlier successful forwards committed when a later destination in the same request fails', function () {
    // forward() used to wrap every destination in one shared transaction, so a permission
    // failure partway through a multi-destination forward rolled back every destination that
    // had already succeeded in that same request — discarding real, already-broadcast sends for
    // no reason related to those destinations. Each destination now commits independently, so a
    // later failure no longer undoes earlier successes.
    $alice = socialUser('alice-fwdpartial@example.com');
    $bob = socialUser('bob-fwdpartial@example.com');
    $carol = socialUser('carol-fwdpartial@example.com');
    $dave = socialUser('dave-fwdpartial@example.com');
    $eve = socialUser('eve-fwdpartial@example.com');

    $sourceConvo = privateConversationBetween($alice, $bob);
    $goodTargetA = privateConversationBetween($alice, $carol);
    $goodTargetB = privateConversationBetween($alice, $dave);
    // Alice is deliberately not a participant here — forwarding to it must 403.
    $forbiddenTarget = privateConversationBetween($eve, $dave);

    $originalId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$sourceConvo}/messages", ['type' => 'text', 'body' => 'partial forward'])
        ->json('data.id');

    $this->actingAs($alice)
        ->postJson("/api/chat/messages/{$originalId}/forward", [
            'conversation_ids' => [$goodTargetA, $goodTargetB, $forbiddenTarget],
        ])
        ->assertForbidden();

    $inA = $this->actingAs($alice)->getJson("/api/chat/conversations/{$goodTargetA}/messages")->assertOk();
    $inB = $this->actingAs($alice)->getJson("/api/chat/conversations/{$goodTargetB}/messages")->assertOk();

    expect(collect($inA->json('data'))->pluck('body'))->toContain('partial forward')
        ->and(collect($inB->json('data'))->pluck('body'))->toContain('partial forward');
});

it('forwards to several conversations with one batched eager-load, not one per forwarded message', function () {
    // Forwarding to N conversations necessarily costs real per-target work (an INSERT, receipt
    // rows, a conversation touch, a broadcast for each), so total query count legitimately
    // grows with N and can't be asserted flat — comparing it wouldn't isolate the eager-load
    // step from that unrelated, expected-to-scale creation cost. Instead this counts queries
    // against five of EAGER's relation tables specifically (starredBy/pinnedIn/pollVotes/
    // eventRsvps/reactions — tables nothing else in the forward path ever touches): loading
    // them per forwarded message inside a map() (the bug this replaced) fires one query per
    // relation per message, so N targets would cost 5xN such queries; a single batched load()
    // on the whole collection costs 5 regardless of N.
    $eagerRelationQueryCountFor = function (int $targetCount) {
        $alice = socialUser('alice-fwdbatch-'.$targetCount.'@example.com');
        $sourceConvo = privateConversationBetween($alice, socialUser('fwdbatch-source-'.$targetCount.'@example.com'));

        $originalId = $this->actingAs($alice)
            ->postJson("/api/chat/conversations/{$sourceConvo}/messages", ['type' => 'text', 'body' => 'broadcast me'])
            ->json('data.id');

        $targets = collect(range(1, $targetCount))->map(
            fn ($i) => privateConversationBetween($alice, socialUser("fwdbatch-target-{$targetCount}-{$i}@example.com"))
        );

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->actingAs($alice)
            ->postJson("/api/chat/messages/{$originalId}/forward", ['conversation_ids' => $targets->all()])
            ->assertOk()
            ->assertJsonCount($targetCount, 'data');
        $eagerQueries = collect(DB::getQueryLog())->filter(fn ($entry) => str_contains(
            $entry['query'],
            'chat_starred_messages'
        ) || str_contains($entry['query'], 'chat_pinned_messages')
            || str_contains($entry['query'], 'chat_poll_votes')
            || str_contains($entry['query'], 'chat_event_rsvps')
            || str_contains($entry['query'], 'chat_message_reactions'));
        DB::disableQueryLog();

        return $eagerQueries->count();
    };

    $withOne = $eagerRelationQueryCountFor(1);
    $withFive = $eagerRelationQueryCountFor(5);

    expect($withFive)->toBe($withOne);
});

it('rejects a forward request with more than 200 target conversations', function () {
    $alice = socialUser('alice-fwdtoomany@example.com');
    $sourceConvo = privateConversationBetween($alice, socialUser('fwdtoomany-source@example.com'));

    $originalId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$sourceConvo}/messages", ['type' => 'text', 'body' => 'hi'])
        ->json('data.id');

    // Validation rejects on array size alone, before touching the DB, so these don't need to
    // be real conversation ids.
    $this->actingAs($alice)
        ->postJson("/api/chat/messages/{$originalId}/forward", ['conversation_ids' => range(1, 201)])
        ->assertInvalid(['conversation_ids']);
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

it('caps the number of edits a single message can accumulate', function () {
    // edit_window_minutes bounds how long a message stays editable, not how many times within
    // that window — without max_edits, repeated edits inside the window could otherwise leave a
    // message with an unbounded number of chat_message_edits history rows.
    config(['chat.message.max_edits' => 2]);

    $alice = socialUser('alice-edit-cap@example.com');
    $bob = socialUser('bob-edit-cap@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $messageId = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'v1'])
        ->json('data.id');

    $this->actingAs($alice)->patchJson("/api/chat/messages/{$messageId}", ['body' => 'v2'])->assertOk();
    $this->actingAs($alice)->patchJson("/api/chat/messages/{$messageId}", ['body' => 'v3'])->assertOk();

    $this->actingAs($alice)
        ->patchJson("/api/chat/messages/{$messageId}", ['body' => 'v4'])
        ->assertStatus(422);

    $history = $this->actingAs($alice)->getJson("/api/chat/messages/{$messageId}/edits")->assertOk();
    expect($history->json('data'))->toHaveCount(2);
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

it('pins and unpins a message, and rejects pinning beyond the per-conversation cap', function () {
    $alice = socialUser('alice-pin@example.com');
    $bob = socialUser('bob-pin@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $messageIds = collect(range(1, 4))->map(fn ($n) => $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => "msg {$n}"])
        ->json('data.id'));

    $messageIds->take(3)->each(
        fn ($messageId) => $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/pin")->assertNoContent()
    );

    $pinned = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}/pinned-messages")->assertOk();
    expect($pinned->json('data'))->toHaveCount(3);

    $this->actingAs($bob)->postJson("/api/chat/messages/{$messageIds->last()}/pin")->assertStatus(422);

    $this->actingAs($bob)->deleteJson("/api/chat/messages/{$messageIds->first()}/pin")->assertNoContent();

    $pinnedAfter = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}/pinned-messages")->assertOk();
    expect($pinnedAfter->json('data'))->toHaveCount(2);
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
