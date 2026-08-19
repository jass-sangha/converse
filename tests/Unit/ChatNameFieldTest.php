<?php

use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Tests\Fixtures\Agent;
use Riwaaq\Chat\Tests\Fixtures\User;

it('resolves the per-alias name_field for an array-shaped chatable_models entry', function () {
    // TestCase::defineEnvironment() already configures 'agent' with an explicit
    // name_field of 'full_name' (array shape) alongside 'user' (plain-string shape).
    expect(Chat::nameFieldFor('agent'))->toBe('full_name');
});

it('falls back to chat.user_search.name_field for a plain-string chatable_models entry', function () {
    expect(Chat::nameFieldFor('user'))->toBe('name');

    config(['chat.user_search.name_field' => 'display_name']);

    expect(Chat::nameFieldFor('user'))->toBe('display_name')
        // The array-shaped 'agent' entry's own name_field is unaffected by the
        // global default changing — it never consults it in the first place.
        ->and(Chat::nameFieldFor('agent'))->toBe('full_name');
});

it('normalizes chatableModels() to a plain alias => FQCN map regardless of entry shape', function () {
    $models = Chat::chatableModels();

    expect($models['user'])->toBe(User::class)
        ->and($models['agent'])->toBe(Agent::class);
});
