export const WALLPAPER_PRESETS = [
    { key: 'default', label: 'Default', css: null },
    { key: 'teal', label: 'Teal', css: '#d9fdd3' },
    { key: 'sand', label: 'Sand', css: '#f0e6d6' },
    { key: 'sky', label: 'Sky', css: '#dcf0fb' },
    { key: 'blush', label: 'Blush', css: '#fbe4e6' },
    { key: 'lilac', label: 'Lilac', css: '#e8e0fb' },
    { key: 'mint', label: 'Mint', css: '#dff5ec' },
    { key: 'charcoal', label: 'Charcoal', css: '#1f2c33' },
];

export function resolveWallpaperCss(wallpaper) {
    if (!wallpaper) return null;

    const preset = WALLPAPER_PRESETS.find((w) => w.key === wallpaper);
    if (preset) return preset.css;

    // Anything else is treated as a custom hex color chosen via the color picker.
    return wallpaper.startsWith('#') ? wallpaper : null;
}
