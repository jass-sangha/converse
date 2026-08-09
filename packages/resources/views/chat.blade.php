<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Chat</title>
    <link rel="stylesheet" href="{{ url(config('chat.asset_route_prefix', 'converse/assets').'/app.css') }}?v={{ $chatConfig['assetVersion'] }}">
    @if($themeOverrideVersion)
        <link rel="stylesheet" href="{{ asset('vendor/chat/theme.css') }}?v={{ $themeOverrideVersion }}">
    @endif
</head>
<body>
    <div id="converse-chat-app"></div>
    <form id="cv-logout-form" method="POST" action="{{ route('logout') }}" class="hidden">
        @csrf
    </form>
    <script>window.ConverseConfig = @json($chatConfig);</script>
    <script src="{{ url(config('chat.asset_route_prefix', 'converse/assets').'/app.js') }}?v={{ $chatConfig['assetVersion'] }}" defer></script>
</body>
</html>
