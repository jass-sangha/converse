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
    // (e.g. .flex becomes #converse-chat-app .flex) so the compiled bundle can be
    // dropped into a host app's own layout without leaking styles either
    // direction — no dependency on the host's own Tailwind setup, and no risk of
    // colliding with the host's own class names. Preflight is disabled below in
    // favor of a small hand-scoped reset in resources/css/app.css, since Tailwind's
    // `important` selector option only scopes utilities, not the base/reset layer.
    important: '#converse-chat-app',
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            colors: {
                converse: {
                    bg: withOpacity('--cv-bg'),
                    surface: withOpacity('--cv-surface'),
                    surfaceHover: withOpacity('--cv-surface-hover'),
                    border: withOpacity('--cv-border'),
                    text: withOpacity('--cv-text'),
                    textMuted: withOpacity('--cv-text-muted'),
                    accent: withOpacity('--cv-accent'),
                    accentContrast: withOpacity('--cv-accent-contrast'),
                    bubbleOut: withOpacity('--cv-bubble-out'),
                    bubbleIn: withOpacity('--cv-bubble-in'),
                    danger: withOpacity('--cv-danger'),
                    overlay: withOpacity('--cv-overlay'),
                    warning: withOpacity('--cv-warning'),
                    info: withOpacity('--cv-info'),
                    railBg: withOpacity('--cv-rail-bg'),
                    chatBg: withOpacity('--cv-chat-bg'),
                    sage: withOpacity('--cv-sage'),
                    sageContrast: withOpacity('--cv-sage-contrast'),
                    textDim: withOpacity('--cv-text-dim'),
                    accentText: withOpacity('--cv-accent-text'),
                    accentTint: withOpacity('--cv-accent-tint'),
                    sageTint: withOpacity('--cv-sage-tint'),
                    sageLine: withOpacity('--cv-sage-line'),
                    sageText: withOpacity('--cv-sage-text'),
                    dangerContrast: withOpacity('--cv-danger-contrast'),
                    tick: withOpacity('--cv-tick'),
                },
            },
            borderRadius: {
                cv: 'var(--cv-radius)',
            },
            boxShadow: {
                cv: '0 1px 2px var(--cv-shadow)',
                'cv-lg': '0 12px 32px var(--cv-shadow-lg)',
            },
            fontFamily: {
                sans: ['Figtree', 'system-ui', 'ui-sans-serif', 'sans-serif'],
                display: ['Caprasimo', 'serif'],
            },
        },
    },
    plugins: [],
};
