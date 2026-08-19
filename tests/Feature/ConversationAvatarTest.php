<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Riwaaq\Chat\Tests\Fixtures\User;

function avatarUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('lets the group admin update the group avatar but rejects a non-admin', function () {
    Storage::fake('chat');

    $alice = avatarUser('alice-avatar@example.com');
    $bob = avatarUser('bob-avatar@example.com');
    $carol = avatarUser('carol-avatar@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Avatar Group',
        'participants' => chatableRefs([$bob, $carol]),
    ])->json('data.id');

    $this->actingAs($bob)
        ->postJson("/api/chat/conversations/{$conversationId}/avatar", ['avatar' => UploadedFile::fake()->image('photo.jpg', 200, 200)])
        ->assertForbidden();

    $response = $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/avatar", ['avatar' => UploadedFile::fake()->image('photo.jpg', 200, 200)])
        ->assertOk();

    expect($response->json('data.avatar_url'))->not->toBeNull();
});

it('lets the group admin remove the group avatar but rejects a non-admin', function () {
    Storage::fake('chat');

    $alice = avatarUser('alice-avatar2@example.com');
    $bob = avatarUser('bob-avatar2@example.com');
    $carol = avatarUser('carol-avatar2@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'group',
        'name' => 'Avatar Group 2',
        'participants' => chatableRefs([$bob, $carol]),
    ])->json('data.id');

    $this->actingAs($alice)
        ->postJson("/api/chat/conversations/{$conversationId}/avatar", ['avatar' => UploadedFile::fake()->image('photo.jpg', 200, 200)])
        ->assertOk();

    $this->actingAs($bob)
        ->deleteJson("/api/chat/conversations/{$conversationId}/avatar")
        ->assertForbidden();

    $response = $this->actingAs($alice)
        ->deleteJson("/api/chat/conversations/{$conversationId}/avatar")
        ->assertOk();

    expect($response->json('data.avatar_url'))->toBeNull();
});

it('lets a user update and remove their own profile avatar', function () {
    Storage::fake('chat');

    $alice = avatarUser('alice-profile@example.com');

    $updated = $this->actingAs($alice)
        ->postJson('/api/chat/profile/avatar', ['avatar' => UploadedFile::fake()->image('photo.jpg', 200, 200)])
        ->assertOk();

    expect($updated->json('data.avatar_url'))->not->toBeNull();

    $removed = $this->actingAs($alice)
        ->deleteJson('/api/chat/profile/avatar')
        ->assertOk();

    expect($removed->json('data.avatar_url'))->toBeNull();
});
