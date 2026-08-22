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
        [$connectionName, $connection] = self::resolveBroadcastConnection();

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

    /**
     * Every broadcaster the bundled widget knows how to drive on the frontend (see
     * resources/js/composables/useEcho.js) — adding support for a new one is exactly two
     * changes: add its name here, and add a matching `else if (driver === '...')` block to
     * useEcho.js. No other backend or frontend code needs to know the list exists.
     *
     * @var list<string>
     */
    public const SUPPORTED_BROADCAST_DRIVERS = ['reverb', 'pusher', 'ably'];

    /**
     * Resolves which broadcaster (and its connection config) to hand the frontend from the host
     * app's own config/broadcasting.php — never anything chat-specific, so switching driver is
     * purely a host-side .env change (BROADCAST_CONNECTION plus that driver's own key).
     *
     * config('broadcasting.default') is trusted whenever it names a SUPPORTED_BROADCAST_DRIVERS
     * entry, even with no key set yet — so `php artisan reverb:install`, which sets
     * BROADCAST_CONNECTION=reverb before REVERB_APP_KEY necessarily exists, isn't silently
     * overridden. Only an unrecognized/unset default (Laravel's out-of-the-box 'log'/'null',
     * neither of which broadcasts) falls through to auto-detecting whichever supported driver
     * actually has a key set — reverb first, as the first-class target — so the widget works as
     * soon as any one driver's credentials exist, with no config('chat.*') broadcasting setting
     * required at all.
     *
     * @return array{0: string, 1: array<string, mixed>}
     */
    protected static function resolveBroadcastConnection(): array
    {
        $default = config('broadcasting.default', 'reverb');

        if (in_array($default, self::SUPPORTED_BROADCAST_DRIVERS, true)) {
            return [$default, config("broadcasting.connections.{$default}", [])];
        }

        foreach (self::SUPPORTED_BROADCAST_DRIVERS as $driver) {
            if (filled(config("broadcasting.connections.{$driver}.key"))) {
                return [$driver, config("broadcasting.connections.{$driver}", [])];
            }
        }

        return ['reverb', config('broadcasting.connections.reverb', [])];
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
