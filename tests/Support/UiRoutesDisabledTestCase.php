<?php

namespace Riwaaq\Chat\Tests\Support;

use Riwaaq\Chat\Tests\TestCase;

/**
 * Provider registration (and the route/migration setup it triggers) runs before
 * defineEnvironment()'s config() overrides apply in this Testbench version —
 * RegisterProviders::bootstrap() precedes defineEnvironment() in
 * CreatesApplication::resolveApplicationBootstrappers() — so a config() override
 * would be too late to affect ChatServiceProvider::configurePackage(). The env()
 * fallback used here works because it's read from real process environment state
 * set before setUp() creates the app, the same path a host's own unpublished-config
 * .env takes — so this exercises the same gate a real app would hit.
 */
class UiRoutesDisabledTestCase extends TestCase
{
    protected function setUp(): void
    {
        putenv('CHAT_REGISTER_UI_ROUTES=false');
        $_ENV['CHAT_REGISTER_UI_ROUTES'] = 'false';
        $_SERVER['CHAT_REGISTER_UI_ROUTES'] = 'false';

        parent::setUp();
    }

    protected function tearDown(): void
    {
        putenv('CHAT_REGISTER_UI_ROUTES');
        unset($_ENV['CHAT_REGISTER_UI_ROUTES'], $_SERVER['CHAT_REGISTER_UI_ROUTES']);

        parent::tearDown();
    }
}
