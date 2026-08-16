import { createApp } from 'vue';
import App from './App.vue';
import './composables/usePreferences';
import '../css/app.css';

createApp(App).mount('#converse-chat-app');

// Lets a host that iframes the full-page chat route auto-size the iframe
// instead of hardcoding a height. Complete no-op outside an iframe (including
// the native <x-chat::widget /> embed and the standalone page loaded directly).
// Vue 3 mounts *into* the container rather than replacing it, so the element
// itself (not the app's, possibly multi-root, $el) is the stable thing to observe.
if (window.self !== window.top && typeof ResizeObserver !== 'undefined') {
    const target = document.getElementById('converse-chat-app');
    let lastHeight = null;

    new ResizeObserver(([entry]) => {
        const height = Math.ceil(entry.contentRect.height);
        if (height !== lastHeight) {
            lastHeight = height;
            window.parent.postMessage({ source: 'converse-chat', height }, '*');
        }
    }).observe(target);
}
