<?php

use Illuminate\Support\Facades\DB;

it('checks conversation participation for a whole list-create request in one query, not one per id', function () {
    // Total query count isn't the right signal here — sync()'s own pivot insert legitimately
    // costs a little more as the conversation_ids array grows, same as any real batch insert
    // would. What must stay flat is specifically the participation check: if
    // guardAllParticipant() still checked membership one id at a time (the isActiveParticipant()
    // N+1 this replaced), each additional id would fire one more query against
    // chat_conversation_participants. Counting only queries against that table isolates the
    // guard from sync()'s unrelated, legitimately-scaling work.
    $participantQueryCountFor = function (int $conversationCount) {
        $alice = socialUser('alice-listbatch-'.$conversationCount.'@example.com');

        $conversationIds = collect(range(1, $conversationCount))->map(
            fn ($i) => privateConversationBetween($alice, socialUser("listbatch-target-{$conversationCount}-{$i}@example.com"))
        );

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->actingAs($alice)->postJson('/api/chat/lists', [
            'name' => 'Batch check',
            'conversation_ids' => $conversationIds->all(),
        ])->assertCreated();
        $participantQueries = collect(DB::getQueryLog())->filter(
            fn ($entry) => str_contains($entry['query'], 'chat_conversation_participants')
        );
        DB::disableQueryLog();

        return $participantQueries->count();
    };

    $withOne = $participantQueryCountFor(1);
    $withFive = $participantQueryCountFor(5);

    expect($withFive)->toBe($withOne);
});

it('creates a list with conversations, lists it, and deletes it', function () {
    $alice = socialUser('alice-list@example.com');
    $bob = socialUser('bob-list@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $created = $this->actingAs($alice)->postJson('/api/chat/lists', [
        'name' => 'Close friends',
        'conversation_ids' => [$conversationId],
    ])->assertCreated();

    expect($created->json('data.name'))->toBe('Close friends')
        ->and($created->json('data.conversation_ids'))->toBe([$conversationId]);

    $listId = $created->json('data.id');

    $index = $this->actingAs($alice)->getJson('/api/chat/lists')->assertOk();
    expect($index->json('data'))->toHaveCount(1);

    $bobsLists = $this->actingAs($bob)->getJson('/api/chat/lists')->assertOk();
    expect($bobsLists->json('data'))->toHaveCount(0);

    $this->actingAs($bob)->deleteJson("/api/chat/lists/{$listId}")->assertForbidden();

    $this->actingAs($alice)->deleteJson("/api/chat/lists/{$listId}")->assertNoContent();

    $indexAfter = $this->actingAs($alice)->getJson('/api/chat/lists')->assertOk();
    expect($indexAfter->json('data'))->toHaveCount(0);
});

it('adds and removes a conversation from a list', function () {
    $alice = socialUser('alice-list2@example.com');
    $bob = socialUser('bob-list2@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $listId = $this->actingAs($alice)
        ->postJson('/api/chat/lists', ['name' => 'Work'])
        ->json('data.id');

    $this->actingAs($alice)
        ->postJson("/api/chat/lists/{$listId}/conversations", ['conversation_id' => $conversationId])
        ->assertNoContent();

    $afterAdd = $this->actingAs($alice)->getJson('/api/chat/lists')->assertOk();
    expect($afterAdd->json('data.0.conversation_ids'))->toBe([$conversationId]);

    $this->actingAs($alice)
        ->deleteJson("/api/chat/lists/{$listId}/conversations/{$conversationId}")
        ->assertNoContent();

    $afterRemove = $this->actingAs($alice)->getJson('/api/chat/lists')->assertOk();
    expect($afterRemove->json('data.0.conversation_ids'))->toBe([]);
});

it('rejects creating a list with a conversation the user is not a participant of', function () {
    $alice = socialUser('alice-list-outsider@example.com');
    $bob = socialUser('bob-list-outsider@example.com');
    $carol = socialUser('carol-list-outsider@example.com');

    // A conversation alice has no part in — carol and bob's, not hers.
    $othersConversationId = privateConversationBetween($bob, $carol);

    $this->actingAs($alice)->postJson('/api/chat/lists', [
        'name' => 'Snooping',
        'conversation_ids' => [$othersConversationId],
    ])->assertForbidden();
});

it('rejects adding a conversation the user is not a participant of to their own list', function () {
    $alice = socialUser('alice-list-add-outsider@example.com');
    $bob = socialUser('bob-list-add-outsider@example.com');
    $carol = socialUser('carol-list-add-outsider@example.com');

    $othersConversationId = privateConversationBetween($bob, $carol);

    $listId = $this->actingAs($alice)
        ->postJson('/api/chat/lists', ['name' => 'Snooping'])
        ->json('data.id');

    $this->actingAs($alice)
        ->postJson("/api/chat/lists/{$listId}/conversations", ['conversation_id' => $othersConversationId])
        ->assertForbidden();
});

it('rejects a create-list request with more than 200 conversation_ids', function () {
    $alice = socialUser('alice-list-toomany@example.com');

    $this->actingAs($alice)->postJson('/api/chat/lists', [
        'name' => 'Too many',
        'conversation_ids' => range(1, 201),
    ])->assertInvalid(['conversation_ids']);
});

it('clears a chat for one participant without affecting the other', function () {
    $alice = socialUser('alice-clear@example.com');
    $bob = socialUser('bob-clear@example.com');
    $conversationId = privateConversationBetween($alice, $bob);

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'one']);
    $this->actingAs($bob)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'two']);

    $this->actingAs($alice)
        ->deleteJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertNoContent();

    $alicesList = $this->actingAs($alice)->getJson("/api/chat/conversations/{$conversationId}/messages")->assertOk();
    expect($alicesList->json('data'))->toHaveCount(0);

    $bobsList = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}/messages")->assertOk();
    expect($bobsList->json('data'))->toHaveCount(2);
});
