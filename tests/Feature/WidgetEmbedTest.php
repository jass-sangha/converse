<?php

use Illuminate\Support\Facades\Blade;
use Riwaaq\Chat\Tests\Fixtures\User;

function widgetEmbedUser(string $email): User
{
    return User::query()->create(['name' => $email, 'email' => $email, 'password' => bcrypt('secret')]);
}

beforeEach(function () {
    config(['broadcasting.connections.reverb' => [
        'driver' => 'reverb',
        'key' => 'test-key',
        'options' => ['host' => '127.0.0.1', 'port' => 8080, 'scheme' => 'http'],
    ]]);
});

it('renders <x-chat::widget /> as a bare fragment, not a full html document', function () {
    $this->actingAs(widgetEmbedUser('widget-fragment@example.com'));

    $html = Blade::render('<x-chat::widget />');

    expect($html)->not->toContain('<html')
        ->not->toContain('<body')
        ->toContain('id="riwaaq-chat-app"')
        ->toContain('window.RiwaaqConfig')
        ->toContain('"embed":true');
});

it('does not duplicate the asset script tag when the widget is included more than once', function () {
    $this->actingAs(widgetEmbedUser('widget-once@example.com'));

    $html = Blade::render('<x-chat::widget /><x-chat::widget />');

    expect(substr_count($html, 'id="riwaaq-chat-app"'))->toBe(1)
        ->and(substr_count($html, '/app.js'))->toBe(1);
});
