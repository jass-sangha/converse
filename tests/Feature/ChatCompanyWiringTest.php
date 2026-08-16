<?php

use App\Models\Company;
use App\Models\User;

test('a company can authenticate via its own guard and be resolved as a chatable', function () {
    $company = Company::factory()->create(['name' => 'Acme Corp']);

    $response = $this->actingAs($company, 'company')->getJson('/api/chat/conversations');

    $response->assertOk();
});

test('a user and a company can hold a conversation together, each with their own chatable_type', function () {
    $user = User::factory()->create(['name' => 'Alice']);
    $company = Company::factory()->create(['name' => 'Acme Corp']);

    $conversationId = $this->actingAs($user)->postJson('/api/chat/conversations', [
        'type' => 'private',
        'participants' => [['type' => 'company', 'id' => $company->id]],
    ])->assertCreated()->json('data.id');

    $this->actingAs($user)->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'type' => 'text',
        'body' => 'Hi Acme, need a quote',
    ])->assertCreated()
        ->assertJsonPath('data.chatable_type', 'user');

    // sanctum.guard checks ['web', 'company'] in order — the earlier actingAs($user)
    // call above left Alice still resolved on the 'web' guard's own instance, which
    // Sanctum would otherwise find first. forgetGuards() forces every guard to
    // re-resolve from scratch, matching how a real request only ever authenticates
    // whichever guard actually owns the incoming session.
    $this->app['auth']->forgetGuards();

    $this->actingAs($company, 'company')
        ->postJson("/api/chat/conversations/{$conversationId}/messages", [
            'type' => 'text',
            'body' => 'Sure, one moment',
        ])
        ->assertCreated()
        ->assertJsonPath('data.chatable_type', 'company')
        ->assertJsonPath('data.chatable_id', $company->id);

    $messages = $this->actingAs($user)
        ->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertOk();

    expect($messages->json('data'))->toHaveCount(2);
});

test('a company is findable through the chat user search API with its own display name', function () {
    $user = User::factory()->create();
    Company::factory()->create(['name' => 'Findable Co']);

    $response = $this->actingAs($user)->getJson('/api/chat/users?type=company&q=Findable');

    $response->assertOk();

    expect(collect($response->json('data'))->pluck('name'))->toContain('Findable Co');
});
