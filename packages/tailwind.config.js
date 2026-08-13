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
                },
            },
            borderRadius: {
                cv: 'var(--cv-radius)',
            },
            fontFamily: {
                sans: ['Figtree', 'system-ui', 'ui-sans-serif', 'sans-serif'],
                display: ['Caprasimo', 'serif'],
            },
        },
    },
    plugins: [],
};
