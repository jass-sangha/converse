<?php

use Riwaaq\Chat\Tests\Fixtures\User;

function pollUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

function pollConversation(User $a, User $b): int
{
    return test()->actingAs($a)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($b)],
    ])->json('data.id');
}

it('creates a single-choice poll and toggles votes', function () {
    $alice = pollUser('alice-poll@example.com');
    $bob = pollUser('bob-poll@example.com');
    $conversationId = pollConversation($alice, $bob);

    $poll = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'poll',
        'metadata' => ['question' => 'Lunch?', 'options' => ['Pizza', 'Sushi']],
    ])->assertCreated();

    $messageId = $poll->json('data.id');
    expect($poll->json('data.poll.options'))->toHaveCount(2)
        ->and($poll->json('data.poll.options.0.count'))->toBe(0);

    $vote = $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/poll/vote", ['option_index' => 0])
        ->assertOk();

    expect($vote->json('data.options.0.count'))->toBe(1)
        ->and($vote->json('data.total_voters'))->toBe(1);

    // Voting for a second option in a single-choice poll replaces the first vote, not adds to it.
    $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/poll/vote", ['option_index' => 1])->assertOk();

    $refreshed = $this->actingAs($alice)->getJson("/api/chat/conversations/{$conversationId}/messages")->json('data.0');
    expect($refreshed['poll']['options'][0]['count'])->toBe(0)
        ->and($refreshed['poll']['options'][1]['count'])->toBe(1)
        ->and($refreshed['poll']['total_voters'])->toBe(1);

    // Voting the same option again retracts it.
    $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/poll/vote", ['option_index' => 1])->assertOk();
    $cleared = $this->actingAs($alice)->getJson("/api/chat/conversations/{$conversationId}/messages")->json('data.0');
    expect($cleared['poll']['total_voters'])->toBe(0);
});

it('allows multiple selections on a multiple-choice poll', function () {
    $alice = pollUser('alice-multipoll@example.com');
    $bob = pollUser('bob-multipoll@example.com');
    $conversationId = pollConversation($alice, $bob);

    $poll = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'poll',
        'metadata' => ['question' => 'Toppings?', 'options' => ['Cheese', 'Olives', 'Mushrooms'], 'multiple' => true],
    ])->assertCreated();

    $messageId = $poll->json('data.id');

    $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/poll/vote", ['option_index' => 0])->assertOk();
    $result = $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/poll/vote", ['option_index' => 2])->assertOk();

    expect($result->json('data.options.0.count'))->toBe(1)
        ->and($result->json('data.options.2.count'))->toBe(1)
        ->and($result->json('data.total_voters'))->toBe(1);
});

it('rejects an out-of-range poll option and a non-participant voter', function () {
    $alice = pollUser('alice-pollguard@example.com');
    $bob = pollUser('bob-pollguard@example.com');
    $carol = pollUser('carol-pollguard@example.com');
    $conversationId = pollConversation($alice, $bob);

    $poll = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'poll',
        'metadata' => ['question' => 'Lunch?', 'options' => ['Pizza', 'Sushi']],
    ])->assertCreated();

    $messageId = $poll->json('data.id');

    $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/poll/vote", ['option_index' => 5])
        ->assertStatus(422);

    $this->actingAs($carol)->postJson("/api/chat/messages/{$messageId}/poll/vote", ['option_index' => 0])
        ->assertStatus(403);
});

it('creates an event and tracks RSVPs', function () {
    $alice = pollUser('alice-event@example.com');
    $bob = pollUser('bob-event@example.com');
    $conversationId = pollConversation($alice, $bob);

    $event = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'event',
        'metadata' => ['title' => 'Team sync', 'starts_at' => now()->addDay()->toIso8601String(), 'location' => 'Room 4'],
    ])->assertCreated();

    $messageId = $event->json('data.id');
    expect($event->json('data.event.going.count'))->toBe(0);

    $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/event/rsvp", ['status' => 'going'])->assertOk();

    $refreshed = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}/messages")->json('data.0');
    expect($refreshed['event']['going']['count'])->toBe(1)
        ->and($refreshed['event']['my_status'])->toBe('going');

    // Changing RSVP moves the respondent, it doesn't add a second entry.
    $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/event/rsvp", ['status' => 'maybe'])->assertOk();
    $changed = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}/messages")->json('data.0');
    expect($changed['event']['going']['count'])->toBe(0)
        ->and($changed['event']['maybe']['count'])->toBe(1);

    // Clearing the RSVP removes it entirely.
    $this->actingAs($bob)->postJson("/api/chat/messages/{$messageId}/event/rsvp", ['status' => null])->assertOk();
    $cleared = $this->actingAs($bob)->getJson("/api/chat/conversations/{$conversationId}/messages")->json('data.0');
    expect($cleared['event']['maybe']['count'])->toBe(0)
        ->and($cleared['event']['my_status'])->toBeNull();
});
