<?php

namespace Converse\Chat\Http\Controllers;

use Illuminate\Http\Request;

class ChatPageController extends Controller
{
    public function show(Request $request)
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

        $assetPath = __DIR__ . '/../../../resources/dist/app.js';
        $themeOverridePath = public_path('vendor/chat/theme.css');

        return view('chat::chat', [
            'chatConfig' => [
                'apiBaseUrl' => '/' . ltrim(config('chat.route_prefix', 'api/chat'), '/'),
                'chatableType' => $request->user()?->getMorphClass(),
                'chatableId' => $request->user()?->getAuthIdentifier(),
                'broadcasting' => [
                    'driver' => $connectionName,
                    'key' => $connection['key'] ?? null,
                    'host' => $connection['options']['host'] ?? null,
                    'port' => $connection['options']['port'] ?? null,
                    'scheme' => $connection['options']['scheme'] ?? null,
                    'cluster' => $connection['options']['cluster'] ?? null,
                ],
                'assetVersion' => is_file($assetPath) ? filemtime($assetPath) : time(),
            ],
            'themeOverrideVersion' => is_file($themeOverridePath) ? filemtime($themeOverridePath) : null,
        ]);
    }
}
