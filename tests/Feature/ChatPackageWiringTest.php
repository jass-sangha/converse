<?php

use App\Models\User;
use Converse\Chat\ChatServiceProvider;
use Converse\Chat\Contracts\ConversationServiceInterface;
use Converse\Chat\Services\ConversationService;
use Illuminate\Support\Facades\Schema;

test('the chat package service provider is registered', function () {
    expect(app()->getLoadedProviders())->toHaveKey(ChatServiceProvider::class);
});

test('the chat package config is merged', function () {
    expect(config('chat.user_model'))->toBe(User::class);
});

test('the chat package migrations have run', function () {
    expect(Schema::hasTable('chat_conversations'))->toBeTrue();
});

test('the chat package container bindings resolve', function () {
    expect(app(ConversationServiceInterface::class))->toBeInstanceOf(ConversationService::class);
});
