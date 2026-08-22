<?php

use Riwaaq\Chat\Contracts\UserSettingsServiceInterface;
use Riwaaq\Chat\Models\UserSetting;
use Riwaaq\Chat\Tests\Fixtures\User;

function scopedLifetimeUser(): User
{
    return User::query()->create([
        'name' => fake()->name(),
        'email' => fake()->unique()->safeEmail(),
        'password' => bcrypt('secret'),
    ]);
}

it('resolves the same cached instance for the resolution chain within one request', function () {
    // The whole point of scoped() over a plain bind(): every resolution point (constructor
    // injection, ad-hoc app() calls) must share one instance so UserSettingsService::get()'s
    // per-chatable memoization actually avoids repeat queries within a single request/job.
    $first = app(UserSettingsServiceInterface::class);
    $second = app(UserSettingsServiceInterface::class);

    expect($first)->toBe($second);
});

it('drops the settings cache when scoped instances are forgotten, as Octane and queue workers do between requests/jobs', function () {
    // ChatServiceProvider binds UserSettingsServiceInterface via scoped(), not singleton(),
    // specifically so it doesn't keep serving one process's first-resolved cache forever under
    // Octane or a persistent queue worker (see its docblock). scoped()'s only actual mechanism
    // is registration into the container's $scopedInstances list, which forgetScopedInstances()
    // clears — that's the exact call Octane's RequestReceived listener and
    // QueueServiceProvider's after-each-job hook both make. Simulating that call here proves
    // the fix's real mechanism without needing an actual Octane server or queue worker process.
    $user = scopedLifetimeUser();

    $before = app(UserSettingsServiceInterface::class);
    $before->get($user);

    app()->forgetScopedInstances();

    $after = app(UserSettingsServiceInterface::class);

    expect($after)->not->toBe($before);
});

it('serves fresh settings after a scoped reset instead of a stale cached row', function () {
    $user = scopedLifetimeUser();

    $before = app(UserSettingsServiceInterface::class);
    expect($before->get($user)->show_read_receipts)->toBeTrue();

    // Bypasses the service entirely, simulating a totally separate process (a different Octane
    // worker, a web request handled while this queue worker sits idle) changing the row.
    // $before's own cache has no way to know — this is exactly the "stale privacy setting
    // served across requests/jobs" failure mode a plain singleton() would never recover from.
    UserSetting::query()
        ->where('chatable_type', $user->getMorphClass())
        ->where('chatable_id', $user->getKey())
        ->update(['show_read_receipts' => false]);

    expect($before->get($user)->show_read_receipts)
        ->toBeTrue('a still-cached instance keeps serving the stale value, as expected');

    app()->forgetScopedInstances();

    $after = app(UserSettingsServiceInterface::class);

    expect($after->get($user)->show_read_receipts)->toBeFalse();
});
