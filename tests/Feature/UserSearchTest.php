<?php

use Riwaaq\Chat\Tests\Fixtures\User;

function searchUser(string $name, string $email): User
{
    return User::query()->create(['name' => $name, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('searches users by name, excluding the authenticated user, and paginates', function () {
    $alice = searchUser('Alice Anderson', 'alice-us@example.com');
    searchUser('Bob Baker', 'bob-us@example.com');
    searchUser('Alicia Cruz', 'alicia-us@example.com');

    $results = $this->actingAs($alice)->getJson('/api/chat/users?q=Ali')->assertOk();

    $names = collect($results->json('data'))->pluck('name');

    expect($names)->toContain('Alicia Cruz')
        ->not->toContain('Alice Anderson')
        ->not->toContain('Bob Baker');
});

it('resolves a batch of user ids without excluding the requester', function () {
    $alice = searchUser('Alice Batch', 'alice-batch@example.com');
    $bob = searchUser('Bob Batch', 'bob-batch@example.com');

    $results = $this->actingAs($alice)
        ->getJson('/api/chat/users?ids[]='.$alice->id.'&ids[]='.$bob->id)
        ->assertOk();

    expect(collect($results->json('data'))->pluck('id'))->toContain($alice->id, $bob->id);
});

it('switches to prefix-only matching when chat.user_search.strategy is starts_with', function () {
    config(['chat.user_search.strategy' => 'starts_with']);

    $alice = searchUser('Alice Prefix', 'alice-prefix@example.com');
    searchUser('Bob Alicetown', 'bob-prefix@example.com'); // "Ali" appears mid-name, not at the start

    $results = $this->actingAs($alice)->getJson('/api/chat/users?q=Ali')->assertOk();

    expect(collect($results->json('data'))->pluck('name'))->not->toContain('Bob Alicetown');
});

it('caps per_page within the allowed range', function () {
    $alice = searchUser('Alice Cap', 'alice-cap@example.com');

    $this->actingAs($alice)->getJson('/api/chat/users?per_page=999')->assertUnprocessable();
});
