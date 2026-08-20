<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Chat</title>
    {{--
        Loads the default --chat-font-sans (Figtree) / --chat-font-display (Caprasimo)
        families declared in theme.css. If you override either variable (via
        theme.css or config('chat.theme.overrides')) to a different font, swap or
        remove this link accordingly — it isn't driven by the theme config itself.
    --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Caprasimo&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
        }
    </style>
</head>
<body>
    @include('chat::partials.assets', ['chatConfig' => $chatConfig, 'themeOverrideVersion' => $themeOverrideVersion, 'iconOverrideVersion' => $iconOverrideVersion, 'wallpaperOverrideVersion' => $wallpaperOverrideVersion])
</body>
</html>
 