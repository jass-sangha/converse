// Wallpaper "ink" for every pattern is `--cv-dots` — the same low-opacity foreground token
// already used for the app's default chat background. It's defined per-theme (light/dark), so
// every pattern automatically stays visible and correctly tinted regardless of theme or which
// background color is layered underneath it, without hardcoding any color here.
const DOT_SIZE = '22px 22px';

export const WALLPAPER_PATTERNS = [
    { key: 'none', label: 'Plain', image: null, size: null },
    {
        key: 'dots',
        label: 'Dots',
        image: 'radial-gradient(circle at 1px 1px, var(--cv-dots) 1px, transparent 0)',
        size: DOT_SIZE,
    },
    {
        key: 'bubbles',
        label: 'Bubbles',
        image: 'radial-gradient(circle at 2px 2px, var(--cv-dots) 2px, transparent 0)',
        size: '34px 34px',
    },
    {
        key: 'grid',
        label: 'Grid',
        image: 'linear-gradient(var(--cv-dots) 1px, transparent 1px), linear-gradient(90deg, var(--cv-dots) 1px, transparent 1px)',
        size: '24px 24px',
    },
    {
        key: 'diagonal',
        label: 'Diagonal',
        image: 'repeating-linear-gradient(45deg, var(--cv-dots), var(--cv-dots) 1px, transparent 1px, transparent 14px)',
        size: null,
    },
    {
        key: 'crosshatch',
        label: 'Crosshatch',
        image: 'repeating-linear-gradient(45deg, var(--cv-dots), var(--cv-dots) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, var(--cv-dots), var(--cv-dots) 1px, transparent 1px, transparent 12px)',
        size: null,
    },
    {
        key: 'checker',
        label: 'Checker',
        image: 'linear-gradient(45deg, var(--cv-dots) 25%, transparent 25%, transparent 75%, var(--cv-dots) 75%), linear-gradient(45deg, var(--cv-dots) 25%, transparent 25%, transparent 75%, var(--cv-dots) 75%)',
        size: '16px 16px',
    },
];

// Every color is a low-opacity tint of an existing theme token (`rgb(var(--cv-*) / alpha)`,
// the same pattern the app's own Tailwind config uses) so it re-tints automatically for
// light/dark themes — never a fixed hex value.
export const WALLPAPER_COLORS = [
    { key: 'default', label: 'Default', css: null },
    { key: 'accent', label: 'Accent', css: 'rgb(var(--cv-accent) / .12)' },
    { key: 'sage', label: 'Sage', css: 'rgb(var(--cv-sage) / .16)' },
    { key: 'info', label: 'Sky', css: 'rgb(var(--cv-info) / .16)' },
    { key: 'danger', label: 'Blush', css: 'rgb(var(--cv-danger) / .12)' },
    { key: 'text', label: 'Slate', css: 'rgb(var(--cv-text) / .07)' },
];

export function encodeWallpaper(patternKey, colorKeyOrHex) {
    if (patternKey === 'none' && colorKeyOrHex === 'default') return null;
    return `${patternKey}|${colorKeyOrHex}`;
}

export function decodeWallpaper(value) {
    // Nothing customized yet — this is the app's own default look (dots + the two
    // accent/sage blobs), not the "Plain" pattern choice a user can explicitly pick.
    if (!value) return { patternKey: 'dots', colorKeyOrHex: 'default' };

    if (!value.includes('|')) {
        // Legacy values: a bare preset key or a custom "#rrggbb" color, no pattern.
        return { patternKey: 'none', colorKeyOrHex: value };
    }

    const separatorIndex = value.indexOf('|');
    return {
        patternKey: value.slice(0, separatorIndex),
        colorKeyOrHex: value.slice(separatorIndex + 1),
    };
}

export function resolveWallpaper(value) {
    const { patternKey, colorKeyOrHex } = decodeWallpaper(value);

    if (colorKeyOrHex?.startsWith('image:')) {
        return {
            isDefault: false,
            patternKey: 'none',
            colorKeyOrHex,
            backgroundImage: `url("${colorKeyOrHex.slice('image:'.length)}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: null,
        };
    }

    const pattern = WALLPAPER_PATTERNS.find((p) => p.key === patternKey) ?? WALLPAPER_PATTERNS[0];
    const colorPreset = WALLPAPER_COLORS.find((c) => c.key === colorKeyOrHex);
    const backgroundColor = colorPreset
        ? colorPreset.css
        : (colorKeyOrHex?.startsWith('#') ? colorKeyOrHex : null);

    return {
        isDefault: !value,
        patternKey,
        colorKeyOrHex,
        backgroundImage: pattern.image,
        backgroundSize: pattern.size,
        backgroundPosition: null,
        backgroundColor,
    };
}
