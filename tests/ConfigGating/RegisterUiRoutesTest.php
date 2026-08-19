<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Riwaaq\Chat\Tests\Support\UiRoutesDisabledTestCase;

uses(UiRoutesDisabledTestCase::class, RefreshDatabase::class);

it('does not register the chat page/web routes when chat.register_ui_routes is false', function () {
    expect(Route::has('riwaaq.chat.page'))->toBeFalse();
});

it('still registers the JSON API routes, since register_ui_routes only gates the web/UI side', function () {
    expect(Route::has('riwaaq.chat.page'))->toBeFalse();

    $names = collect(Route::getRoutes())->map(fn ($route) => $route->uri())->values();

    expect($names->contains('api/chat/conversations'))->toBeTrue();
});
