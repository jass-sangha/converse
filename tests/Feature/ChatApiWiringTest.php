<?php

use App\Models\User;
use Illuminate\Contracts\Http\Kernel;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

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

test('the stateful sanctum middleware survives every provider booting, including Sanctum\'s own', function () {
    // Regression guard: ChatServiceProvider registers EnsureFrontendRequestsAreStateful on
    // the 'api' group by pushing onto the HTTP Kernel (not the Router directly). A push made
    // on the Router alone gets silently wiped whenever a later-booting provider — Sanctum's
    // own service provider included — touches the Kernel's middleware priority list, because
    // the Kernel re-syncs its own (unmodified) copy of the group back onto the Router.
    $apiGroup = app(Kernel::class)->getMiddlewareGroups()['api'];

    expect($apiGroup)->toContain(EnsureFrontendRequestsAreStateful::class);
});
