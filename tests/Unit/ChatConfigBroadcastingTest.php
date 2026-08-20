<?php

use Riwaaq\Chat\Support\ChatConfig;

it('trusts an explicit broadcasting.default of reverb, pusher, or ably even without a key set yet', function (string $driver) {
    config(['broadcasting.default' => $driver]);
    config(["broadcasting.connections.{$driver}" => null]);

    expect(ChatConfig::build(null)['broadcasting']['driver'])->toBe($driver);
})->with(['reverb', 'pusher', 'ably']);

it('surfaces the key of the explicitly configured driver, not any other configured one', function () {
    config(['broadcasting.default' => 'ably']);
    config(['broadcasting.connections.ably' => ['driver' => 'ably', 'key' => 'ably-key']]);
    config(['broadcasting.connections.pusher' => ['driver' => 'pusher', 'key' => 'pusher-key']]);

    $broadcasting = ChatConfig::build(null)['broadcasting'];

    expect($broadcasting['driver'])->toBe('ably')
        ->and($broadcasting['key'])->toBe('ably-key');
});

it('auto-detects pusher when broadcasting.default is unsupported/unset but only pusher has a key', function () {
    config(['broadcasting.default' => 'log']);
    config(['broadcasting.connections.reverb' => null]);
    config(['broadcasting.connections.pusher' => ['driver' => 'pusher', 'key' => 'pusher-key', 'options' => ['cluster' => 'eu']]]);
    config(['broadcasting.connections.ably' => null]);

    $broadcasting = ChatConfig::build(null)['broadcasting'];

    expect($broadcasting['driver'])->toBe('pusher')
        ->and($broadcasting['key'])->toBe('pusher-key')
        ->and($broadcasting['cluster'])->toBe('eu');
});

it('auto-detects ably when broadcasting.default is unsupported/unset but only ably has a key', function () {
    config(['broadcasting.default' => 'log']);
    config(['broadcasting.connections.reverb' => null]);
    config(['broadcasting.connections.pusher' => null]);
    config(['broadcasting.connections.ably' => ['driver' => 'ably', 'key' => 'ably-key']]);

    $broadcasting = ChatConfig::build(null)['broadcasting'];

    expect($broadcasting['driver'])->toBe('ably')
        ->and($broadcasting['key'])->toBe('ably-key');
});

it('falls back to reverb when broadcasting.default is unsupported/unset and nothing has a key configured', function () {
    config(['broadcasting.default' => 'log']);
    config(['broadcasting.connections.reverb' => null]);
    config(['broadcasting.connections.pusher' => null]);
    config(['broadcasting.connections.ably' => null]);

    expect(ChatConfig::build(null)['broadcasting']['driver'])->toBe('reverb');
});
