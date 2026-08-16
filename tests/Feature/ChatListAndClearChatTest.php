<?php

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

    // Another user's lists stay private to them.
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
