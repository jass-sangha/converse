// Wallpaper "ink" for the tileable patterns: a tint of the theme's own foreground text color
// (`--chat-text`), at an opacity high enough to actually read as a pattern rather than the
// near-invisible `--chat-dots` token the app's default background used. It's still just a themed
// token — never a hardcoded color — so it flips correctly between light and dark automatically.
const INK = "rgb(var(--chat-text) / .16)";

// Picker swatches are ~40px, far smaller than several of these patterns' real tile sizes (up to
// 84px) — at full size a swatch would show at most a sliver of one repeat, making patterns look
// indistinguishable from each other (or from Plain). Each pattern that needs it carries a
// `preview` image/size scaled down specifically for the swatch, independent of the size actually
// used on the chat background.
export const WALLPAPER_PATTERNS = [
    {
        key: "default",
        label: "Dots",
        image: `radial-gradient(circle at 1px 1px, ${INK} 1px, transparent 0)`,
        size: "50px 50px",
        preview: { size: "12px 12px" },
    },
    { key: "none", label: "Plain", image: null, size: null },
    {
        key: "dots-tighter",
        label: "Dots (tighter gaps)",
        image: `radial-gradient(circle at 1px 1px, ${INK} 1px, transparent 0)`,
        size: "30px 30px",
        preview: { size: "8px 8px" },
    },
    {
        key: "lines",
        label: "Lines",
        image: `repeating-linear-gradient(45deg, ${INK}, ${INK} 2px, transparent 2px, transparent 64px)`,
        size: "auto",
        // The 64px repeat period is baked into the gradient itself, not controlled by
        // background-size, so the preview needs its own smaller-period gradient to show more than
        // a single sliver of one stripe.
        preview: {
            image: `repeating-linear-gradient(45deg, ${INK}, ${INK} 1.5px, transparent 1.5px, transparent 9px)`,
        },
    },
    {
        key: "checks",
        label: "Boxes",
        // Two layers (horizontal + vertical grid lines) both tiled at the same size — spelled out
        // per-layer rather than as a single "84px 84px" value, because when `resolveWallpaper`
        // appends a color-tint layer after this pattern's own layers, CSS cycles a shorter
        // background-size list across all image layers; a single value would then land on the
        // wrong layer (the vertical lines would get the tint's "cover" instead of their own tile
        // size and stop repeating).
        image: `linear-gradient(${INK} 1.5px, transparent 1.5px), linear-gradient(90deg, ${INK} 1.5px, transparent 1.5px)`,
        size: "84px 84px, 84px 84px",
        preview: { size: "14px 14px, 14px 14px" },
    },
];

// Every color is a low-opacity tint of an existing theme token (`rgb(var(--chat-*) / alpha)`,
// the same pattern the app's own Tailwind config uses) so it re-tints automatically for
// light/dark themes — never a fixed hex value.
export const WALLPAPER_COLORS = [
    { key: "default", label: "Default", css: null },
    { key: "info", label: "Sky", css: "rgb(var(--chat-info) / .16)" },
    { key: "danger", label: "Blush", css: "rgb(var(--chat-danger) / .12)" },
    { key: "text", label: "Slate", css: "rgb(var(--chat-text) / .07)" },
];

export function encodeWallpaper(patternKey, colorKeyOrHex) {
    // Every explicit pick — including "default" pattern + "default" color — is stored as-is, never
    // collapsed to null. Null is reserved for a conversation that has never had its wallpaper
    // touched (falls back to the user's global default); collapsing an explicit "default|default"
    // pick to null used to make it indistinguishable from "untouched", so picking Default could
    // resurface a stale global default (e.g. an old uploaded photo) instead of the plain pattern.
    return `${patternKey}|${colorKeyOrHex}`;
}

export function decodeWallpaper(value) {
    // Nothing customized yet — the app's default dot pattern.
    if (!value) return { patternKey: "default", colorKeyOrHex: "default" };

    if (!value.includes("|")) {
        // Legacy values: a bare preset key or a custom "#rrggbb" color, no pattern.
        return { patternKey: "none", colorKeyOrHex: value };
    }

    const separatorIndex = value.indexOf("|");
    return {
        patternKey: value.slice(0, separatorIndex),
        colorKeyOrHex: value.slice(separatorIndex + 1),
    };
}

export function resolveWallpaper(value) {
    const { patternKey, colorKeyOrHex } = decodeWallpaper(value);

    if (colorKeyOrHex?.startsWith("image:")) {
        return {
            isDefault: false,
            patternKey: "none",
            colorKeyOrHex,
            backgroundImage: `url("${colorKeyOrHex.slice("image:".length)}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        };
    }

    const pattern =
        WALLPAPER_PATTERNS.find((p) => p.key === patternKey) ??
        WALLPAPER_PATTERNS[0];
    const colorPreset = WALLPAPER_COLORS.find((c) => c.key === colorKeyOrHex);
    const tint = colorPreset
        ? colorPreset.css
        : colorKeyOrHex?.startsWith("#")
          ? colorKeyOrHex
          : null;

    // The tint is layered as a solid-color gradient alongside the pattern, not returned as a
    // plain `background-color` — a `background-color` would replace the app's own
    // `bg-riwaaq-chatBg` base entirely rather than composite on top of it, and at these low
    // opacities that leaves the page's raw background showing through instead of a tinted surface.
    const layers = [];
    const sizes = [];
    if (pattern.image) {
        layers.push(pattern.image);
        sizes.push(pattern.size);
    }
    if (tint) {
        layers.push(`linear-gradient(${tint}, ${tint})`);
        sizes.push("cover");
    }

    return {
        isDefault: !value,
        patternKey,
        colorKeyOrHex,
        backgroundImage: layers.length ? layers.join(", ") : null,
        backgroundSize: sizes.length ? sizes.join(", ") : null,
        backgroundPosition: null,
    };
}
