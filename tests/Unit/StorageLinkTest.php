<?php

use Illuminate\Support\Facades\File;
use Riwaaq\Chat\ChatServiceProvider;

/**
 * Exercises ChatServiceProvider::ensureStorageLinkExists() directly (via reflection)
 * against a throwaway temp directory rather than the shared Testbench skeleton, since
 * public_path()/storage_path() are only redirectable *after* the app (and this
 * provider) has already booted once with their real defaults.
 */
it('creates the public/storage symlink automatically when it is missing', function () {
    $base = sys_get_temp_dir().'/riwaaq-storage-link-'.uniqid();
    File::ensureDirectoryExists($base.'/storage/app/public');
    File::ensureDirectoryExists($base.'/public');

    $this->app->useStoragePath($base.'/storage');
    $this->app->usePublicPath($base.'/public');

    expect(is_link(public_path('storage')))->toBeFalse();

    $provider = new ChatServiceProvider($this->app);
    $method = new ReflectionMethod($provider, 'ensureStorageLinkExists');
    $method->invoke($provider, storage_path('app/public/chat'));

    expect(is_link(public_path('storage')))->toBeTrue()
        ->and(realpath(public_path('storage')))->toBe(realpath(storage_path('app/public')));

    File::deleteDirectory($base);
});

it('is a no-op when the symlink already exists', function () {
    $base = sys_get_temp_dir().'/riwaaq-storage-link-'.uniqid();
    File::ensureDirectoryExists($base.'/storage/app/public');
    File::ensureDirectoryExists($base.'/public');
    symlink($base.'/storage/app/public', $base.'/public/storage');

    $this->app->useStoragePath($base.'/storage');
    $this->app->usePublicPath($base.'/public');

    $provider = new ChatServiceProvider($this->app);
    $method = new ReflectionMethod($provider, 'ensureStorageLinkExists');

    // Would throw ("File exists") if it tried to recreate an already-present link.
    $method->invoke($provider, storage_path('app/public/chat'));

    expect(is_link(public_path('storage')))->toBeTrue();

    File::deleteDirectory($base);
});

it('does not touch public/storage when chat.media.disk_root has been customized', function () {
    $base = sys_get_temp_dir().'/riwaaq-storage-link-'.uniqid();
    File::ensureDirectoryExists($base.'/storage/app/public');
    File::ensureDirectoryExists($base.'/public');

    $this->app->useStoragePath($base.'/storage');
    $this->app->usePublicPath($base.'/public');

    $provider = new ChatServiceProvider($this->app);
    $method = new ReflectionMethod($provider, 'ensureStorageLinkExists');
    $method->invoke($provider, '/some/custom/disk/root');

    expect(is_link(public_path('storage')))->toBeFalse();

    File::deleteDirectory($base);
});
