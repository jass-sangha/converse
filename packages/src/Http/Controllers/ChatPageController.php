<?php

namespace Converse\Chat\Http\Controllers;

use Illuminate\Http\Request;

class ChatPageController extends Controller
{
    public function show(Request $request)
    {
        $reverb = config('broadcasting.connections.reverb');

        abort_if($reverb === null, 500,
            'No "reverb" broadcasting connection is configured. Run `php artisan reverb:install` in the host app, '.
            'or define config(\'broadcasting.connections.reverb\') manually.');

        $assetPath = __DIR__.'/../../../resources/dist/app.js';
        $themeOverridePath = public_path('vendor/chat/theme.css');

        return view('chat::chat', [
            'chatConfig' => [
                'apiBaseUrl' => '/'.ltrim(config('chat.route_prefix', 'api/chat'), '/'),
                'userId' => $request->user()?->getAuthIdentifier(),
                'reverb' => [
                    'key' => $reverb['key'] ?? null,
                    'host' => $reverb['options']['host'] ?? null,
                    'port' => $reverb['options']['port'] ?? 443,
                    'scheme' => $reverb['options']['scheme'] ?? 'https',
                ],
                'assetVersion' => is_file($assetPath) ? filemtime($assetPath) : time(),
            ],
            'themeOverrideVersion' => is_file($themeOverridePath) ? filemtime($themeOverridePath) : null,
        ]);
    }
}
