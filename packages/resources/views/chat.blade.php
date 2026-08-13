<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Chat</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Caprasimo&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
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
 