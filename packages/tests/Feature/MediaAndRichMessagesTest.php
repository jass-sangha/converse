<?php

use Converse\Chat\Tests\Fixtures\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

function mediaUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('uploads an attachment and sends it as an image message', function () {
    Storage::fake('chat');

    $alice = mediaUser('alice-media@example.com');
    $bob = mediaUser('bob-media@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $upload = $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->image('photo.jpg', 200, 200),
    ])->assertCreated();

    $attachmentId = $upload->json('data.id');

    $message = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'image',
        'attachment_ids' => [$attachmentId],
    ])->assertCreated();

    expect($message->json('data.type'))->toBe('image')
        ->and($message->json('data.attachments'))->toHaveCount(1);

    // Bob cannot attach Alice's already-uploaded, already-attached file to his own message.
    $this->actingAs($bob)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'image',
        'attachment_ids' => [$attachmentId],
    ])->assertStatus(403);
});

it('rejects an oversized or wrong-type attachment upload', function () {
    Storage::fake('chat');

    $alice = mediaUser('alice-oversize@example.com');

    $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->create('malware.exe', 10, 'application/x-msdownload'),
    ])->assertStatus(422);

    $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->create('huge.jpg', 20 * 1024, 'image/jpeg'),
    ])->assertStatus(422);
});

it('sends a location message and a contact message', function () {
    $alice = mediaUser('alice-loc@example.com');
    $bob = mediaUser('bob-loc@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $location = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'location',
        'metadata' => ['lat' => 37.7749, 'lng' => -122.4194, 'name' => 'San Francisco'],
    ])->assertCreated();

    expect($location->json('data.metadata.lat'))->toBe(37.7749);

    $contact = $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'contact',
        'metadata' => ['name' => 'Jane Doe', 'phones' => ['+1234567890']],
    ])->assertCreated();

    expect($contact->json('data.metadata.name'))->toBe('Jane Doe');

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'location',
        'metadata' => ['name' => 'Missing coordinates'],
    ])->assertStatus(422);
});

it('fetches and caches a link preview', function () {
    $alice = mediaUser('alice-preview@example.com');

    Http::fake([
        'example.com/*' => Http::response(
            '<html><head><meta property="og:title" content="Example Title"><meta property="og:description" content="Example Desc"></head></html>',
            200
        ),
    ]);

    $response = $this->actingAs($alice)
        ->postJson('/api/chat/link-preview', ['url' => 'https://example.com/page'])
        ->assertOk();

    expect($response->json('data.title'))->toBe('Example Title')
        ->and($response->json('data.description'))->toBe('Example Desc');

    // Second call should be served from cache, not a second HTTP request.
    $this->actingAs($alice)->postJson('/api/chat/link-preview', ['url' => 'https://example.com/page'])->assertOk();

    Http::assertSentCount(1);
});
