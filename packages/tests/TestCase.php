<?php

namespace Converse\Chat\Tests;

use Converse\Chat\ChatServiceProvider;
use Converse\Chat\Tests\Fixtures\Agent;
use Converse\Chat\Tests\Fixtures\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Orchestra\Testbench\TestCase as Orchestra;

class TestCase extends Orchestra
{
    protected function setUp(): void
    {
        parent::setUp();

        Factory::guessFactoryNamesUsing(
            fn (string $modelName) => 'Converse\\Chat\\Database\\Factories\\'.class_basename($modelName).'Factory'
        );
    }

    protected function getPackageProviders($app): array
    {
        return [ChatServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('chat.chatable_models', ['user' => User::class, 'agent' => Agent::class]);
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
