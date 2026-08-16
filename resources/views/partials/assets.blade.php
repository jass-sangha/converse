{{--
    Shared by chat.blade.php (full page) and components/widget.blade.php (embed).
    Wrapped in a keyed @once so accidentally including it more than once on the
    same page never duplicates the mount div or the asset tags.
--}}
@once('chat-widget-assets')
    <link rel="stylesheet" href="{{ url(config('chat.asset_route_prefix', 'converse/assets').'/app.css') }}?v={{ $chatConfig['assetVersion'] }}">
    @if($themeOverrideVersion)
        <link rel="stylesheet" href="{{ asset('vendor/chat/theme.css') }}?v={{ $themeOverrideVersion }}">
    @endif
    {!! \Converse\Chat\Support\ChatConfig::themeOverrideStyles() !!}
    <div id="converse-chat-app"></div>
    <script>window.ConverseConfig = @json($chatConfig);</script>
    <script src="{{ url(config('chat.asset_route_prefix', 'converse/assets').'/app.js') }}?v={{ $chatConfig['assetVersion'] }}" defer></script>
@endonce
