<?php

namespace Riwaaq\Chat\Tests;

use Illuminate\Database\Eloquent\Factories\Factory;
use Orchestra\Testbench\TestCase as Orchestra;
use Riwaaq\Chat\ChatServiceProvider;
use Riwaaq\Chat\Tests\Fixtures\Agent;
use Riwaaq\Chat\Tests\Fixtures\User;

class TestCase extends Orchestra
{
    protected function setUp(): void
    {
        parent::setUp();

        Factory::guessFactoryNamesUsing(
            fn (string $modelName) => 'Riwaaq\\Chat\\Database\\Factories\\'.class_basename($modelName).'Factory'
        );
    }

    protected function getPackageProviders($app): array
    {
        return [ChatServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('chat.chatable_models', [
            'user' => User::class,
            // Array shape (vs. User's plain-string shape above) exercises the per-alias
            // name_field override across the whole suite, not just one dedicated test.
            'agent' => ['model' => Agent::class, 'name_field' => 'full_name'],
        ]);
        $app['config']->set('chat.middleware', ['api']);
        $app['config']->set('database.default', 'testing');
        $app['config']->set('auth.providers.users.model', User::class);
        $app['config']->set('broadcasting.default', 'null');
        $app['config']->set('cache.default', 'array');
        $app['config']->set('queue.default', 'sync');
    }

    protected function defineDatabaseMigrations(): void
    {
        // Package migrations are intentionally NOT loaded here — they must come from
        // ChatServiceProvider's own registration (hasMigrations()->runsMigrations()),
        // so this test suite verifies the real consumer-facing install path.
        $this->loadMigrationsFrom(__DIR__.'/database/migrations');
    }
}
