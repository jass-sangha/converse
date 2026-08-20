<?php

namespace Riwaaq\Chat\Support;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Str;

/**
 * Builds the window.RiwaaqConfig payload and the theme-override inline
 * <style> block, shared by both the full-page route (ChatPageController) and
 * the embeddable <x-chat::widget /> component so neither duplicates the other.
 */
class ChatConfig
{
    /**
     * @return array<string, mixed>
     */
    public static function build(?Authenticatable $actor, bool $embed = false): array
    {
        $connectionName = config('broadcasting.default', 'reverb');
        $connection = config("broadcasting.connections.{$connectionName}");

        if (! in_array($connectionName, ['reverb', 'pusher'])) {
            if (config('broadcasting.connections.reverb.key')) {
                $connectionName = 'reverb';
                $connection = config('broadcasting.connections.reverb');
            } elseif (config('broadcasting.connections.pusher.key')) {
                $connectionName = 'pusher';
                $connection = config('broadcasting.connections.pusher');
            } else {
                $connectionName = 'reverb';
                $connection = config('broadcasting.connections.reverb') ?? [];
            }
        }

        $assetPath = __DIR__.'/../../resources/dist/app.js';

        return [
            'apiBaseUrl' => '/'.ltrim(config('chat.route_prefix', 'api/chat'), '/'),
            'chatableType' => $actor?->getMorphClass(),
            'chatableId' => $actor?->getAuthIdentifier(),
            'broadcasting' => [
                'driver' => $connectionName,
                'key' => $connection['key'] ?? null,
                'host' => $connection['options']['host'] ?? null,
                'port' => $connection['options']['port'] ?? null,
                'scheme' => $connection['options']['scheme'] ?? null,
                'cluster' => $connection['options']['cluster'] ?? null,
            ],
            'assetVersion' => is_file($assetPath) ? filemtime($assetPath) : time(),
            'embed' => $embed,
        ];
    }

    public static function themeOverrideVersion(): ?int
    {
        $path = public_path('vendor/chat/theme.css');

        return is_file($path) ? filemtime($path) : null;
    }

    public static function iconOverrideVersion(): ?int
    {
        $path = public_path('vendor/chat/icons.js');

        return is_file($path) ? filemtime($path) : null;
    }

    /**
     * A config-only alternative to publishing/hand-editing icons.js — renders
     * chat.theme.icons as an inline <script> that seeds window.RiwaaqIconOverrides
     * before the published icons.js (if any) and the app bundle run. Applied
     * first so a hand-published icons.js can still override it icon-by-icon.
     */
    public static function iconOverrideScript(): string
    {
        $icons = config('chat.theme.icons', []);

        if (empty($icons)) {
            return '';
        }

        // Not user input — values come from config/chat.php, which only the host
        // app itself controls, so raw (unescaped) output into a <script> tag is safe.
        return '<script>window.RiwaaqIconOverrides = Object.assign('.json_encode($icons).', window.RiwaaqIconOverrides || {});</script>';
    }

    public static function wallpaperOverrideVersion(): ?int
    {
        $path = public_path('vendor/chat/wallpapers.js');

        return is_file($path) ? filemtime($path) : null;
    }

    /**
     * Same idea as iconOverrideScript(), for the wallpaper picker's patterns/colors —
     * renders chat.theme.wallpapers (a ['patterns' => [...], 'colors' => [...]] shape,
     * each keyed by pattern/color key) as an inline <script> seeding
     * window.RiwaaqWallpaperOverrides before the published wallpapers.js (if any) and
     * the app bundle run.
     */
    public static function wallpaperOverrideScript(): string
    {
        $wallpapers = config('chat.theme.wallpapers', []);

        if (empty($wallpapers['patterns']) && empty($wallpapers['colors'])) {
            return '';
        }

        // Not user input — values come from config/chat.php, which only the host
        // app itself controls, so raw (unescaped) output into a <script> tag is safe.
        return '<script>window.RiwaaqWallpaperOverrides = {'
            .'patterns: Object.assign('.json_encode($wallpapers['patterns'] ?? []).', (window.RiwaaqWallpaperOverrides || {}).patterns || {}),'
            .'colors: Object.assign('.json_encode($wallpapers['colors'] ?? []).', (window.RiwaaqWallpaperOverrides || {}).colors || {}),'
            .'};</script>';
    }

    /**
     * A config-only alternative to publishing/hand-editing theme.css — renders
     * chat.theme.overrides as an inline <style> block scoped to the widget's
     * mount element, applied after both stylesheets so it wins the cascade.
     */
    public static function themeOverrideStyles(): string
    {
        $overrides = config('chat.theme.overrides', []);

        if (empty($overrides)) {
            return '';
        }

        $vars = collect($overrides)
            ->map(fn ($value, $token) => '--chat-'.Str::kebab($token).': '.$value.';')
            ->implode('');

        // Not user input — values come from config/chat.php, which only the host
        // app itself controls, so raw (unescaped) output into a <style> tag is safe.
        return '<style>#riwaaq-chat-app{'.$vars.'}</style>';
    }
}
