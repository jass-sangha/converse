<?php

use Illuminate\Support\Facades\Route;
use Riwaaq\Chat\Http\Controllers\AssetController;
use Riwaaq\Chat\Http\Controllers\ChatPageController;
use Riwaaq\Chat\Http\Middleware\SetFrameAncestors;

Route::middleware(config('chat.asset_middleware', []))->group(function () {
    Route::get(config('chat.asset_route_prefix', 'riwaaq/assets').'/app.js', [AssetController::class, 'js']);
    Route::get(config('chat.asset_route_prefix', 'riwaaq/assets').'/app.css', [AssetController::class, 'css']);
});

Route::middleware(config('chat.web_middleware', ['web', 'auth']))
    ->prefix(config('chat.chat_route_prefix', 'riwaaq'))
    ->group(function () {
        Route::get('chat', [ChatPageController::class, 'show'])
            ->middleware(SetFrameAncestors::class)
            ->name('riwaaq.chat.page');
    });
