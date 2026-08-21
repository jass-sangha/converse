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
                'chat-sm': 'var(--chat-radius-sm)',
                chat: 'var(--chat-radius)',
                'chat-lg': 'var(--chat-radius-lg)',
                'chat-xl': 'var(--chat-radius-xl)',
                // The bubble's flat "tail" corner (rounded-{b,t}{l,r}-chat-tail) — kept
                // separate from the main `chat` radius since it's deliberately tighter.
                'chat-tail': 'var(--chat-radius-tail)',
            },
            borderWidth: {
                // Only the bare `border` utility (no numeric suffix) picks this up —
                // `border-2` etc. stay literal, since those are deliberate one-off
                // accents (avatar rings, etc.), not the widget's themeable border.
                DEFAULT: 'var(--chat-border-width)',
            },
            boxShadow: {
                // Full shadow values (offset + blur + color) live in the CSS
                // variable itself so blur/spread are themeable, not just color.
                chat: 'var(--chat-shadow)',
                'chat-lg': 'var(--chat-shadow-lg)',
            },
            fontFamily: {
                sans: ['var(--chat-font-sans)'],
                display: ['var(--chat-font-display)'],
            },
        },
    },
    plugins: [],
};
