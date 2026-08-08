<?php

use Converse\Chat\Events\ConversationCreated;
use Converse\Chat\Events\ParticipantAdded;
use Converse\Chat\Tests\Fixtures\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Support\Facades\Event;

function pushUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('broadcasts ConversationCreated onto each participants private user channel', function () {
    Event::fake([ConversationCreated::class]);

    $alice = pushUser('alice-push@example.com');
    $bob = pushUser('bob-push@example.com');

    $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participant_ids' => [$bob->id],
    ])->assertCreated();

    Event::assertDispatched(ConversationCreated::class, function (ConversationCreated $event) use ($alice, $bob) {
        $channelNames = collect($event->broadcastOn())->map(fn (PrivateChannel $c) => $c->name);

        return $channelNames->contains("private-user.{$alice->id}")
            && $channelNames->contains("private-user.{$bob->id}");
    });
});

it('broadcasts ParticipantAdded onto the conversation channel and each new participants private channel', function () {
    Event::fake([ParticipantAdded::class]);

    $alice = pushUser('alice-push-grp@example.com');
    $bob = pushUser('bob-push-grp@example.com');
    $carol = pushUser('carol-push-grp@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Push test',
        'participant_ids' => [$bob->id],
    ])->json('data.id');

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/participants", [
        'user_ids' => [$carol->id],
    ])->assertOk();

    Event::assertDispatched(ParticipantAdded::class, function (ParticipantAdded $event) use ($carol) {
        $channelNames = collect($event->broadcastOn())->map(fn ($c) => $c->name);

        return $channelNames->contains("private-user.{$carol->id}");
    });
});
