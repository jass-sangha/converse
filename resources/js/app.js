import { createApp } from 'vue';
import App from './App.vue';
import './composables/usePreferences';
import '../css/app.css';
import { registerIcons } from './icons/registry';
import { defaultIcons } from './icons/defaults';
import { registerWallpaperPatterns, registerWallpaperColors } from './wallpapers';

registerIcons(defaultIcons);
// Seeded (in cascade order) by config('chat.theme.icons') inline <script>, the
// published icons.js, or a host script set before this bundle loads — whichever
// ran last on the page wins, since registerIcons() here always runs last.
if (window.RiwaaqIconOverrides) {
    registerIcons(window.RiwaaqIconOverrides);
}

// Same idea as the icon overrides above, for the wallpaper picker's patterns/colors —
// seeded by config('chat.theme.wallpapers') and/or the published wallpapers.js.
if (window.RiwaaqWallpaperOverrides) {
    registerWallpaperPatterns(window.RiwaaqWallpaperOverrides.patterns);
    registerWallpaperColors(window.RiwaaqWallpaperOverrides.colors);
}

createApp(App).mount('#riwaaq-chat-app');

// Lets a host that iframes the full-page chat route auto-size the iframe
// instead of hardcoding a height. Complete no-op outside an iframe (including
// the native <x-chat::widget /> embed and the standalone page loaded directly).
// Vue 3 mounts *into* the container rather than replacing it, so the element
// itself (not the app's, possibly multi-root, $el) is the stable thing to observe.
if (window.self !== window.top && typeof ResizeObserver !== 'undefined') {
    const target = document.getElementById('riwaaq-chat-app');
    let lastHeight = null;

    new ResizeObserver(([entry]) => {
        const height = Math.ceil(entry.contentRect.height);
        if (height !== lastHeight) {
            lastHeight = height;
            window.parent.postMessage({ source: 'riwaaq-chat', height }, '*');
        }
    }).observe(target);
}
