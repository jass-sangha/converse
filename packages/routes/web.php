<?php

use Converse\Chat\Http\Controllers\AssetController;
use Converse\Chat\Http\Controllers\ChatPageController;
use Converse\Chat\Http\Middleware\SetFrameAncestors;
use Illuminate\Support\Facades\Route;

Route::middleware(config('chat.asset_middleware', []))->group(function () {
    Route::get(config('chat.asset_route_prefix', 'converse/assets').'/app.js', [AssetController::class, 'js']);
    Route::get(config('chat.asset_route_prefix', 'converse/assets').'/app.css', [AssetController::class, 'css']);
});

Route::middleware(config('chat.web_middleware', ['web', 'auth']))
    ->prefix(config('chat.chat_route_prefix', 'converse'))
    ->group(function () {
        Route::get('chat', [ChatPageController::class, 'show'])
            ->middleware(SetFrameAncestors::class)
            ->name('converse.chat.page');
    });
