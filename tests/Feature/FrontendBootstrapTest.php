<?php

use Riwaaq\Chat\Tests\Fixtures\User;

function frontendUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

it('serves the built js and css assets with correct content types', function () {
    $this->get('/riwaaq/assets/app.js')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/javascript; charset=UTF-8');

    $this->get('/riwaaq/assets/app.css')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/css; charset=UTF-8');
});

it('renders the mount page with a RiwaaqConfig script tag when reverb is configured', function () {
    config(['broadcasting.connections.reverb' => [
        'driver' => 'reverb',
        'key' => 'test-key',
        'options' => ['host' => '127.0.0.1', 'port' => 8080, 'scheme' => 'http'],
    ]]);

    $user = frontendUser('frontend-page@example.com');

    $response = $this->actingAs($user)->get('/riwaaq/chat');

    $response->assertOk();
    $response->assertSee('riwaaq-chat-app', false);
    $response->assertSee('window.RiwaaqConfig', false);
    $response->assertSee('test-key', false);
});

it('still renders the mount page when no reverb broadcasting connection is configured', function () {
    config(['broadcasting.connections.reverb' => null]);

    $user = frontendUser('frontend-noreverb@example.com');

    $response = $this->actingAs($user)->get('/riwaaq/chat');

    $response->assertOk();
    $response->assertSee('riwaaq-chat-app', false);
});

it('applies the theme synchronously before the deferred app.js bundle to avoid a flash of the wrong theme', function () {
    $user = frontendUser('frontend-theme-sync@example.com');

    $html = $this->actingAs($user)->get('/riwaaq/chat')->assertOk()->getContent();

    $mountPosition = strpos($html, 'id="riwaaq-chat-app"');
    $themeScriptPosition = strpos($html, "localStorage.getItem('riwaaq:theme')");
    $deferredBundlePosition = strpos($html, ' defer>');

    expect($mountPosition)->not->toBeFalse()
        ->and($themeScriptPosition)->not->toBeFalse()
        ->and($deferredBundlePosition)->not->toBeFalse()
        ->and($themeScriptPosition)->toBeGreaterThan($mountPosition)
        ->and($themeScriptPosition)->toBeLessThan($deferredBundlePosition);
});
