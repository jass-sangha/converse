<?php

use Riwaaq\Chat\Contracts\MessageRepositoryInterface;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Tests\Fixtures\User;

function summaryUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('collapses N receipt rows into one summary entry per message, with correct aggregate counts', function () {
    // The literal claim behind receiptSummariesFor(): a message with 10 recipients used to mean
    // loading 10 receipt (+ chatable) rows just to derive its status. This proves the repository
    // now returns exactly one entry per message id, however many receipts feed into it.
    $alice = summaryUser('alice-summary@example.com');
    $others = collect(range(1, 10))->map(fn ($i) => summaryUser("summary-other-{$i}@example.com"));

    $conversationId = test()->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Summary check',
        'participants' => chatableRefs($others),
    ])->json('data.id');

    $messageId = test()->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'hi'])
        ->json('data.id');

    // All 10 delivered, 6 of those also read.
    $others->values()->each(function ($user, $index) use ($conversationId, $messageId) {
        test()->actingAs($user)->postJson("/api/chat/conversations/{$conversationId}/receipts/delivered")->assertNoContent();

        if ($index < 6) {
            test()->actingAs($user)->postJson("/api/chat/conversations/{$conversationId}/receipts/read", [
                'up_to_message_id' => $messageId,
            ])->assertNoContent();
        }
    });

    $summaries = app(MessageRepositoryInterface::class)->receiptSummariesFor([$messageId]);

    // Exactly one entry for the one message id — not one per receipt (would be 10).
    expect($summaries)->toHaveCount(1)
        ->and($summaries[$messageId])->toBe([
            'recipient_count' => 10,
            'delivered_count' => 10,
            'read_count' => 6,
        ]);
});

it('batches summaries for many messages in one call, and zero-fills messages with no receipts', function () {
    $alice = summaryUser('alice-summarybatch@example.com');
    $bob = summaryUser('bob-summarybatch@example.com');

    $conversationId = test()->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $ids = collect(range(1, 3))->map(fn ($i) => test()->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => "msg {$i}"])
        ->json('data.id'));

    test()->actingAs($bob)->postJson("/api/chat/conversations/{$conversationId}/receipts/read", [
        'up_to_message_id' => $ids[1],
    ])->assertNoContent();

    $summaries = app(MessageRepositoryInterface::class)->receiptSummariesFor($ids->all());

    expect($summaries)->toHaveCount(3)
        // Messages 1 and 2 (index 0, 1) are covered by the read-up-to call.
        ->and($summaries[$ids[0]]['read_count'])->toBe(1)
        ->and($summaries[$ids[1]]['read_count'])->toBe(1)
        // Message 3 (index 2) is only delivered via the read call's own delivered side effect,
        // not read.
        ->and($summaries[$ids[2]]['read_count'])->toBe(0);
});

it('never eager-loads the receipts relation for a paginated conversation listing', function () {
    // The whole point of the batched summary: paginateForConversation() must not carry the
    // receipts relation on its returned models at all — if it did, every recipient's full row
    // would still be materialized regardless of whether MessageResource ever reads it.
    $alice = summaryUser('alice-noeager@example.com');
    $bob = summaryUser('bob-noeager@example.com');

    $conversationId = test()->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    test()->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'hi'])
        ->assertCreated();

    $conversation = Conversation::query()->findOrFail($conversationId);
    $paginator = app(MessageRepositoryInterface::class)->paginateForConversation($conversation, $alice, 50);

    expect($paginator->getCollection()->every(fn ($message) => ! $message->relationLoaded('receipts')))->toBeTrue();
});

it('never counts a receipt as read when the recipient has read-receipt sharing turned off', function () {
    $alice = summaryUser('alice-summaryprivacy@example.com');
    $bob = summaryUser('bob-summaryprivacy@example.com');

    $conversationId = test()->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    test()->actingAs($bob)->patchJson('/api/chat/profile/settings', ['show_read_receipts' => false])->assertOk();

    $messageId = test()->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/messages", ['type' => 'text', 'body' => 'hi'])
        ->json('data.id');

    test()->actingAs($bob)->postJson("/api/chat/conversations/{$conversationId}/receipts/read", [
        'up_to_message_id' => $messageId,
    ])->assertNoContent();

    $summaries = app(MessageRepositoryInterface::class)->receiptSummariesFor([$messageId]);

    expect($summaries[$messageId]['read_count'])->toBe(0)
        ->and($summaries[$messageId]['delivered_count'])->toBe(1);
});
