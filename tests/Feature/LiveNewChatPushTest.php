<?php

use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Support\Facades\Event;
use Riwaaq\Chat\Events\ConversationCreated;
use Riwaaq\Chat\Events\MessageSent;
use Riwaaq\Chat\Events\ParticipantAdded;
use Riwaaq\Chat\Tests\Fixtures\User;

function pushUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('broadcasts ConversationCreated onto each participants private chatable channel', function () {
    Event::fake([ConversationCreated::class]);

    $alice = pushUser('alice-push@example.com');
    $bob = pushUser('bob-push@example.com');

    $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->assertCreated();

    Event::assertDispatched(ConversationCreated::class, function (ConversationCreated $event) use ($alice, $bob) {
        $channelNames = collect($event->broadcastOn())->map(fn (PrivateChannel $c) => $c->name);

        return $channelNames->contains("private-chatable.user.{$alice->id}")
            && $channelNames->contains("private-chatable.user.{$bob->id}");
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
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/participants", [
        'participants' => [chatableRef($carol)],
    ])->assertOk();

    Event::assertDispatched(ParticipantAdded::class, function (ParticipantAdded $event) use ($carol) {
        $channelNames = collect($event->broadcastOn())->map(fn ($c) => $c->name);

        return $channelNames->contains("private-chatable.user.{$carol->id}");
    });
});

it('broadcasts MessageSent onto the conversation channel and the recipients own private channel', function () {
    Event::fake([MessageSent::class]);

    $alice = pushUser('alice-push-msg@example.com');
    $bob = pushUser('bob-push-msg@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'hey bob',
    ])->assertCreated();

    // Without both of these, the recipient only learns about a new message while that specific
    // conversation happens to be the one open in their ChatWindow — everywhere else (the sidebar
    // list for a conversation not currently open) silently never updates until a manual reload.
    Event::assertDispatched(MessageSent::class, function (MessageSent $event) use ($conversationId, $alice, $bob) {
        $channelNames = collect($event->broadcastOn())->map(fn ($c) => $c->name);

        return $channelNames->contains((new PresenceChannel("conversation.{$conversationId}"))->name)
            && $channelNames->contains("private-chatable.user.{$bob->id}")
            // The sender's own personal channel shouldn't be a broadcast target here — their
            // own UI already updates optimistically off the HTTP response, not the broadcast.
            && ! $channelNames->contains("private-chatable.user.{$alice->id}");
    });
});
