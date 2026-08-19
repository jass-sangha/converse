/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
    return ({ opacityValue }) =>
        opacityValue === undefined
            ? `rgb(var(${variableName}))`
            : `rgb(var(${variableName}) / ${opacityValue})`;
}

export default {
    content: [
        './resources/js/**/*.{vue,js}',
        './resources/views/**/*.blade.php',
    ],
    // Scopes every generated utility class under the widget's own mount element
    // (e.g. .flex becomes #riwaaq-chat-app .flex) so the compiled bundle can be
    // dropped into a host app's own layout without leaking styles either
    // direction — no dependency on the host's own Tailwind setup, and no risk of
    // colliding with the host's own class names. Preflight is disabled below in
    // favor of a small hand-scoped reset in resources/css/app.css, since Tailwind's
    // `important` selector option only scopes utilities, not the base/reset layer.
    important: '#riwaaq-chat-app',
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            colors: {
                riwaaq: {
                    bg: withOpacity('--chat-bg'),
                    surface: withOpacity('--chat-surface'),
                    surfaceHover: withOpacity('--chat-surface-hover'),
                    border: withOpacity('--chat-border'),
                    text: withOpacity('--chat-text'),
                    textMuted: withOpacity('--chat-text-muted'),
                    accent: withOpacity('--chat-accent'),
                    accentContrast: withOpacity('--chat-accent-contrast'),
                    bubbleOut: withOpacity('--chat-bubble-out'),
                    bubbleIn: withOpacity('--chat-bubble-in'),
                    danger: withOpacity('--chat-danger'),
                    overlay: withOpacity('--chat-overlay'),
                    warning: withOpacity('--chat-warning'),
                    info: withOpacity('--chat-info'),
                    railBg: withOpacity('--chat-rail-bg'),
                    chatBg: withOpacity('--chat-chat-bg'),
                    sage: withOpacity('--chat-sage'),
                    sageContrast: withOpacity('--chat-sage-contrast'),
                    textDim: withOpacity('--chat-text-dim'),
                    accentText: withOpacity('--chat-accent-text'),
                    accentTint: withOpacity('--chat-accent-tint'),
                    sageTint: withOpacity('--chat-sage-tint'),
                    sageLine: withOpacity('--chat-sage-line'),
                    sageText: withOpacity('--chat-sage-text'),
                    dangerContrast: withOpacity('--chat-danger-contrast'),
                    tick: withOpacity('--chat-tick'),
                },
            },
            borderRadius: {
                chat: 'var(--chat-radius)',
            },
            boxShadow: {
                chat: '0 1px 2px var(--chat-shadow)',
                'chat-lg': '0 12px 32px var(--chat-shadow-lg)',
            },
            fontFamily: {
                sans: ['Figtree', 'system-ui', 'ui-sans-serif', 'sans-serif'],
                display: ['Caprasimo', 'serif'],
            },
        },
    },
    plugins: [],
};
