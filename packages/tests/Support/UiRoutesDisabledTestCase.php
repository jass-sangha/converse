<?php

namespace Converse\Chat\Tests\Support;

use Converse\Chat\Tests\TestCase;

/**
 * Route/migration registration happens once, at provider-register time, which —
 * in this Testbench version — runs BEFORE defineEnvironment()'s config overrides
 * are applied (RegisterProviders::bootstrap() precedes the defineEnvironment()
 * call in CreatesApplication::resolveApplicationBootstrappers()). A config()
 * override set there is simply too late to affect ChatServiceProvider::
 * configurePackage(). The env() fallback IS early enough, since it's read from
 * real process environment state set here, before setUp() ever creates the app —
 * exactly the same path a host's own .env file takes in a real, unpublished-config
 * install, so this is testing the same gate a real app would actually hit.
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
