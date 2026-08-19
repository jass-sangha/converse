<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Riwaaq\Chat\Tests\Fixtures\User;

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

it('forwards a media message with its attachment intact', function () {
    Storage::fake('chat');

    $alice = mediaUser('alice-fwdmedia@example.com');
    $bob = mediaUser('bob-fwdmedia@example.com');
    $carol = mediaUser('carol-fwdmedia@example.com');

    $convoAB = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $convoAC = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($carol)],
    ])->json('data.id');

    $attachmentId = $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->image('photo.jpg', 200, 200),
    ])->json('data.id');

    $originalId = $this->actingAs($alice)->postJson("/api/chat/conversations/{$convoAB}/messages", [
        'type' => 'image',
        'attachment_ids' => [$attachmentId],
    ])->json('data.id');

    $forwarded = $this->actingAs($alice)
        ->postJson("/api/chat/messages/{$originalId}/forward", ['conversation_ids' => [$convoAC]])
        ->assertOk();

    expect($forwarded->json('data.0.type'))->toBe('image')
        ->and($forwarded->json('data.0.attachments'))->toHaveCount(1)
        ->and($forwarded->json('data.0.attachments.0.original_filename'))->toContain('photo');

    // The original message must keep its own attachment untouched.
    $original = $this->actingAs($alice)->getJson("/api/chat/conversations/{$convoAB}/messages")->json('data');
    expect(collect($original)->firstWhere('id', $originalId)['attachments'])->toHaveCount(1);
});

it('rejects an oversized attachment upload but accepts any file type', function () {
    Storage::fake('chat');

    $alice = mediaUser('alice-oversize@example.com');

    // Anything not explicitly categorized falls back to the generic 'document' bucket rather
    // than being rejected — the app shouldn't gatekeep what kind of file people can share.
    $uncategorized = $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->create('archive.rar', 10, 'application/x-rar-compressed'),
    ])->assertCreated();
    expect($uncategorized->json('data.mime_type'))->toBe('application/x-rar-compressed');

    // Size limits still apply, keyed off that same fallback category's own configured max.
    $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->create('huge.jpg', 20 * 1024, 'image/jpeg'),
    ])->assertStatus(422);

    $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->create('huge.rar', 60 * 1024, 'application/x-rar-compressed'),
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

it('aggregates media across every conversation the user participates in, not just one', function () {
    Storage::fake('chat');

    $alice = mediaUser('alice-allmedia@example.com');
    $bob = mediaUser('bob-allmedia@example.com');
    $carol = mediaUser('carol-allmedia@example.com');
    $dave = mediaUser('dave-allmedia@example.com');

    $convoAB = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $convoAC = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($carol)],
    ])->json('data.id');

    $attachmentInAB = $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->image('ab.jpg', 200, 200),
    ])->json('data.id');

    $attachmentInAC = $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->image('ac.jpg', 200, 200),
    ])->json('data.id');

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$convoAB}/messages", [
        'type' => 'image', 'attachment_ids' => [$attachmentInAB],
    ])->assertCreated();

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$convoAC}/messages", [
        'type' => 'image', 'attachment_ids' => [$attachmentInAC],
    ])->assertCreated();

    // Alice never opens/lists convoAB or convoAC again before requesting "all media" —
    // the endpoint must aggregate across both conversations from the database, not a client cache.
    $all = $this->actingAs($alice)->getJson('/api/chat/messages/media?kind=media')->assertOk();
    expect($all->json('data'))->toHaveCount(2);

    $scoped = $this->actingAs($alice)
        ->getJson("/api/chat/messages/media?kind=media&conversation_id={$convoAB}")
        ->assertOk();
    expect($scoped->json('data'))->toHaveCount(1);

    // Dave is not a participant of either conversation — he must not see Alice's media.
    $daveView = $this->actingAs($dave)->getJson('/api/chat/messages/media?kind=media')->assertOk();
    expect($daveView->json('data'))->toHaveCount(0);
});

it('searches media by filename or by chat/contact name', function () {
    Storage::fake('chat');

    $alice = mediaUser('alice-mediasearch@example.com');
    $bob = mediaUser('bob-mediasearch@example.com');
    $carol = mediaUser('carol-mediasearch@example.com');

    $convoWithBob = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    $convoWithCarol = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($carol)],
    ])->json('data.id');

    $vacationPhoto = $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->image('vacation-photo.jpg', 200, 200),
    ])->json('data.id');

    $receiptScan = $this->actingAs($alice)->postJson('/api/chat/attachments', [
        'file' => UploadedFile::fake()->image('receipt-scan.jpg', 200, 200),
    ])->json('data.id');

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$convoWithBob}/messages", [
        'type' => 'image', 'attachment_ids' => [$vacationPhoto],
    ])->assertCreated();

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$convoWithCarol}/messages", [
        'type' => 'image', 'attachment_ids' => [$receiptScan],
    ])->assertCreated();

    // Filename match finds only the message with that attachment, regardless of chat.
    $byFilename = $this->actingAs($alice)->getJson('/api/chat/messages/media?kind=media&q=vacation')->assertOk();
    expect($byFilename->json('data'))->toHaveCount(1)
        ->and($byFilename->json('data.0.attachments.0.original_filename'))->toContain('vacation-photo');

    // Contact-name match finds every media item shared in that chat, regardless of filename.
    $byContactName = $this->actingAs($alice)->getJson('/api/chat/messages/media?kind=media&q=carol-mediasearch')->assertOk();
    expect($byContactName->json('data'))->toHaveCount(1)
        ->and($byContactName->json('data.0.attachments.0.original_filename'))->toContain('receipt-scan');

    $noMatch = $this->actingAs($alice)->getJson('/api/chat/messages/media?kind=media&q=nonexistent-term')->assertOk();
    expect($noMatch->json('data'))->toHaveCount(0);
});

it('lists a link in the media links tab even without a fetched preview', function () {
    $alice = mediaUser('alice-linkslist@example.com');
    $bob = mediaUser('bob-linkslist@example.com');

    $conversationId = $this->actingAs($alice)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [chatableRef($bob)],
    ])->json('data.id');

    // No metadata.link_preview attached — mirrors a message sent before the composer's
    // debounced OG-preview fetch had a chance to resolve.
    $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'check this out https://example.com/page',
    ])->assertCreated();

    $this->actingAs($alice)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'no link here',
    ])->assertCreated();

    $links = $this->actingAs($alice)->getJson('/api/chat/messages/media?kind=links')->assertOk();

    expect($links->json('data'))->toHaveCount(1)
        ->and($links->json('data.0.body'))->toContain('https://example.com/page');
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

it('retries a link preview that failed instead of caching the empty result', function () {
    $alice = mediaUser('alice-preview-retry@example.com');

    // One fake registration with a sequence — Http::fake() resets its own request log each
    // time it's called, so this is the correct way to assert a real second network attempt
    // rather than a replayed cache hit.
    Http::fake([
        'dead-site.example/*' => Http::sequence()
            ->push('', 500)
            ->push('<html><head><meta property="og:title" content="Back Up"></head></html>', 200),
    ]);

    $first = $this->actingAs($alice)
        ->postJson('/api/chat/link-preview', ['url' => 'https://dead-site.example/page'])
        ->assertOk();
    expect($first->json('data.title'))->toBeNull();

    // A second attempt should retry over the network rather than replay the cached failure —
    // a dead site now responding shouldn't stay "no preview" for the rest of the cache TTL.
    $second = $this->actingAs($alice)
        ->postJson('/api/chat/link-preview', ['url' => 'https://dead-site.example/page'])
        ->assertOk();
    expect($second->json('data.title'))->toBe('Back Up');

    Http::assertSentCount(2);
});
