// Wallpaper "ink" for the tileable patterns: a tint of the theme's own foreground text color
// (`--cv-text`), at an opacity high enough to actually read as a pattern rather than the
// near-invisible `--cv-dots` token the app's default background used. It's still just a themed
// token — never a hardcoded color — so it flips correctly between light and dark automatically.
const INK = "rgb(var(--cv-text) / .16)";
const DOT_SIZE = "22px 22px";

// The two soft corner blobs from the app's original default background, expressed as
// background layers (not fixed DOM elements) so they compose into the same pattern system as
// everything else and render correctly in the picker's small preview swatches too.
const BLOBS_IMAGE =
    "radial-gradient(circle at 88% 0%, rgb(var(--cv-bubble-out) / .55) 0%, transparent 45%), " +
    "radial-gradient(circle at 8% 100%, rgb(var(--cv-sage-tint) / .5) 0%, transparent 45%)";
const BLOBS_SIZE = "cover, cover";

export const WALLPAPER_PATTERNS = [
    {
        key: "default",
        label: "Default",
        image: `radial-gradient(circle at 1px 1px, ${INK} 1px, transparent 0), ${BLOBS_IMAGE}`,
        size: `${DOT_SIZE}, ${BLOBS_SIZE}`,
    },
    { key: "none", label: "Plain", image: null, size: null },
    {
        key: "dots",
        label: "Dots",
        image: `radial-gradient(circle at 1px 1px, ${INK} 1px, transparent 0)`,
        size: DOT_SIZE,
    },
    {
        key: "bubbles",
        label: "Bubbles",
        image: `radial-gradient(circle at 2px 2px, ${INK} 2px, transparent 0)`,
        size: "36px 36px",
    },
    {
        key: "grid",
        label: "Grid",
        image: `linear-gradient(${INK} 1px, transparent 1px), linear-gradient(90deg, ${INK} 1px, transparent 1px)`,
        size: "24px 24px",
    },
    {
        key: "diagonal",
        label: "Diagonal",
        image: `repeating-linear-gradient(45deg, ${INK}, ${INK} 1px, transparent 1px, transparent 16px)`,
        size: null,
    },
    {
        key: "blobs",
        label: "Blobs",
        image: BLOBS_IMAGE,
        size: BLOBS_SIZE,
    },
];

// Every color is a low-opacity tint of an existing theme token (`rgb(var(--cv-*) / alpha)`,
// the same pattern the app's own Tailwind config uses) so it re-tints automatically for
// light/dark themes — never a fixed hex value.
export const WALLPAPER_COLORS = [
    { key: "default", label: "Default", css: null },
    { key: "info", label: "Sky", css: "rgb(var(--cv-info) / .16)" },
    { key: "danger", label: "Blush", css: "rgb(var(--cv-danger) / .12)" },
    { key: "text", label: "Slate", css: "rgb(var(--cv-text) / .07)" },
];

export function encodeWallpaper(patternKey, colorKeyOrHex) {
    if (patternKey === "default" && colorKeyOrHex === "default") return null;
    return `${patternKey}|${colorKeyOrHex}`;
}

export function decodeWallpaper(value) {
    // Nothing customized yet — the app's own original look (dots + the two blobs).
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
    // `bg-converse-chatBg` base entirely rather than composite on top of it, and at these low
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
