// Wallpaper "ink" for the tileable patterns: a tint of the theme's own foreground text color
// (`--cv-text`), at an opacity high enough to actually read as a pattern rather than the
// near-invisible `--cv-dots` token the app's default background used. It's still just a themed
// token — never a hardcoded color — so it flips correctly between light and dark automatically.
const INK = "rgb(var(--cv-text) / .16)";
const DOT_SIZE = "22px 22px";

// The two big soft corner circles from the app's original default background. They used to be
// fixed 320px/380px `rounded-full` <div>s anchored past the container's edges; reproduced here as
// solid-edge radial-gradient layers at the same size/position so they read as the same big
// circles, not a diffuse glow, while still composing into the pattern/picker system.
const BLOB_ONE_IMAGE =
    "radial-gradient(circle, rgb(var(--cv-bubble-out) / .55) 100%, transparent 100%)";
const BLOB_ONE_SIZE = "320px 320px";
const BLOB_ONE_POSITION = "right -60px top -90px";

const BLOB_TWO_IMAGE =
    "radial-gradient(circle, rgb(var(--cv-sage-tint) / .5) 100%, transparent 100%)";
const BLOB_TWO_SIZE = "380px 380px";
const BLOB_TWO_POSITION = "left 40px bottom -120px";

const BLOBS_IMAGE = `${BLOB_ONE_IMAGE}, ${BLOB_TWO_IMAGE}`;
const BLOBS_SIZE = `${BLOB_ONE_SIZE}, ${BLOB_TWO_SIZE}`;
const BLOBS_POSITION = `${BLOB_ONE_POSITION}, ${BLOB_TWO_POSITION}`;
const BLOBS_REPEAT = "no-repeat, no-repeat";

export const WALLPAPER_PATTERNS = [
    {
        key: "default",
        label: "Default",
        image: `radial-gradient(circle at 1px 1px, ${INK} 1px, transparent 0), ${BLOBS_IMAGE}`,
        size: `${DOT_SIZE}, ${BLOBS_SIZE}`,
        position: `0 0, ${BLOBS_POSITION}`,
        repeat: `repeat, ${BLOBS_REPEAT}`,
    },
    { key: "none", label: "Plain", image: null, size: null },
    {
        key: "dots-tight",
        label: "Tight dots",
        image: `radial-gradient(circle at 1px 1px, ${INK} 1px, transparent 0)`,
        size: "20px 20px",
    },
    {
        key: "dots-spread",
        label: "Spread dots",
        image: `radial-gradient(circle at 1px 1px, ${INK} 1px, transparent 0)`,
        size: "46px 46px",
    },
    {
        key: "checks",
        label: "Boxes",
        image: `linear-gradient(${INK} 1.5px, transparent 1.5px), linear-gradient(90deg, ${INK} 1.5px, transparent 1.5px)`,
        size: "84px 84px",
    },
    {
        key: "lines",
        label: "Lines",
        image: `repeating-linear-gradient(45deg, ${INK}, ${INK} 2px, transparent 2px, transparent 64px)`,
        size: null,
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
        // Only a few patterns (default, checks) need non-default position/repeat for their own
        // layers; when present, CSS cycles the values for any extra (e.g. tint) layer, which is
        // harmless for a `cover`-sized solid fill — so these can be passed through as-is.
        backgroundPosition: pattern.position ?? null,
        backgroundRepeat: pattern.repeat ?? null,
    };
}
