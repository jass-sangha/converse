{{--
    <x-chat::widget /> — drop this directly into your own Blade layout to embed
    the chat UI as a native part of the page (no iframe, no separate route).

    Requirements:
    - The widget fills its parent container's size — give that container an
      explicit CSS height (e.g. `<div style="height: 640px">`), otherwise it
      collapses to zero height.
    - Only one instance is supported per page (it mounts to a fixed element id).
      For a full standalone page instead, use the riwaaq.chat.page route.
--}}
@php
    $chatConfig = \Riwaaq\Chat\Support\ChatConfig::build(auth()->user(), embed: true);
    $themeOverrideVersion = \Riwaaq\Chat\Support\ChatConfig::themeOverrideVersion();
@endphp
@include('chat::partials.assets', ['chatConfig' => $chatConfig, 'themeOverrideVersion' => $themeOverrideVersion])
