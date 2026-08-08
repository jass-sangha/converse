<?php

use App\Models\User;

test('an authenticated app user can search for other chat users through the chat package API', function () {
    $me = User::factory()->create();
    $other = User::factory()->create(['name' => 'Findable Person']);

    $response = $this->actingAs($me)->getJson('/api/chat/users?q=Findable');

    $response->assertOk();

    expect(collect($response->json('data'))->pluck('name'))->toContain('Findable Person');
});

test('the chat conversations endpoint is reachable for an authenticated app user', function () {
    $me = User::factory()->create();

    $this->actingAs($me)->getJson('/api/chat/conversations')->assertOk();
});
