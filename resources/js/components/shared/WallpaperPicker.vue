<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import {
    WALLPAPER_PATTERNS,
    WALLPAPER_COLORS,
    decodeWallpaper,
    encodeWallpaper,
} from "../../wallpapers";
import { useMessages } from "../../composables/useMessages";
import { useExclusiveDropdown } from "../../composables/useExclusiveDropdown";
import { useDropdownPlacement } from "../../composables/useDropdownPlacement";

const props = defineProps({
    modelValue: { type: String, default: null },
});

const emit = defineEmits(["update:modelValue"]);

// Native `<input type="color">` has no alpha channel in any shipping browser, so custom colors
// can't offer a user-facing opacity control there — instead every custom pick gets this same
// fixed low opacity, matching how the preset tints look (they're ~12-16% too).
const CUSTOM_COLOR_OPACITY = 20;

const { uploadAttachment } = useMessages();
const imageInput = ref(null);
const uploadingImage = ref(false);

// Custom color opens as a plain in-DOM dropdown — the same placement mechanism every other menu
// in the app uses (SettingRow's option lists, the mute-duration menu, etc.) — rather than the
// browser's own native color-picker dialog, whose on-screen position we have no control over and
// which clips against a viewport edge this panel is docked flush against.
const colorMenuRoot = ref(null);
const showColorMenu = ref(false);
const { opened: colorMenuOpened, closed: colorMenuClosed } = useExclusiveDropdown();
const { openUp: colorMenuOpenUp, maxHeight: colorMenuMaxHeight, place: placeColorMenu } =
    useDropdownPlacement();
const hexDraft = ref("");

const current = computed(() => decodeWallpaper(props.modelValue));
const isImage = computed(() => current.value.colorKeyOrHex?.startsWith("image:"));
// Custom colors are stored as an 8-digit "#rrggbbaa" hex so the fixed tint opacity travels with
// them; legacy 6-digit "#rrggbb" values (picked before this existed) are treated as fully opaque.
const isCustomHex = computed(() => /^#[0-9a-fA-F]{6,8}$/.test(current.value.colorKeyOrHex ?? ""));
const customBaseHex = computed(() =>
    isCustomHex.value ? current.value.colorKeyOrHex.slice(0, 7) : "#c67139",
);

function hexWithAlpha(hex, opacityPercent) {
    const alphaHex = Math.round((opacityPercent / 100) * 255)
        .toString(16)
        .padStart(2, "0");
    return `${hex}${alphaHex}`;
}

function pickPattern(patternKey) {
    emit("update:modelValue", encodeWallpaper(patternKey, current.value.colorKeyOrHex));
}

function pickColor(colorKey) {
    emit("update:modelValue", encodeWallpaper(current.value.patternKey, colorKey));
}

function applyCustomColor(hex) {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    const withAlpha = hexWithAlpha(hex, CUSTOM_COLOR_OPACITY);
    emit("update:modelValue", encodeWallpaper(current.value.patternKey, withAlpha));
}

function pickCustomColor(event) {
    hexDraft.value = event.target.value;
    applyCustomColor(event.target.value);
}

function onHexDraftInput() {
    let value = hexDraft.value.trim();
    if (value && !value.startsWith("#")) value = `#${value}`;
    applyCustomColor(value);
}

function closeColorMenu() {
    showColorMenu.value = false;
}

function onColorMenuDocumentClick(event) {
    if (colorMenuRoot.value && !colorMenuRoot.value.contains(event.target)) closeColorMenu();
}

watch(showColorMenu, (open) => {
    if (open) {
        hexDraft.value = customBaseHex.value;
        colorMenuOpened(closeColorMenu);
        document.addEventListener("click", onColorMenuDocumentClick);
    } else {
        colorMenuClosed(closeColorMenu);
        document.removeEventListener("click", onColorMenuDocumentClick);
    }
});

onBeforeUnmount(() => {
    colorMenuClosed(closeColorMenu);
    document.removeEventListener("click", onColorMenuDocumentClick);
});

function toggleColorMenu() {
    if (!showColorMenu.value) placeColorMenu(colorMenuRoot.value, { preferredHeight: 220 });
    showColorMenu.value = !showColorMenu.value;
}

function pickImage() {
    imageInput.value.click();
}

async function onImageChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    uploadingImage.value = true;
    try {
        const attachment = await uploadAttachment(file);
        // Keep whatever pattern was already selected (even though it's inert while an image is
        // active) so pattern and image/color choices stay independent — switching away from the
        // image later restores the pattern instead of always landing back on "Plain".
        emit(
            "update:modelValue",
            encodeWallpaper(current.value.patternKey, `image:${attachment.url}`),
        );
    } finally {
        uploadingImage.value = false;
    }
}
</script>

<template>
    <div class="cv-wallpaper-picker">
        <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-converse-textDim">
            Pattern
        </p>
        <div class="mb-4 flex flex-wrap gap-[9px]">
            <button
                v-for="pattern in WALLPAPER_PATTERNS"
                :key="pattern.key"
                type="button"
                :title="pattern.label"
                class="relative h-10 w-10 rounded-[10px] border border-converse-border bg-converse-surfaceHover"
                :class="isImage ? 'cursor-not-allowed opacity-30 grayscale' : ''"
                :disabled="isImage"
                :style="{
                    backgroundImage: pattern.preview?.image ?? pattern.image ?? 'none',
                    backgroundSize: pattern.preview?.size ?? pattern.size ?? 'auto',
                }"
                @click="pickPattern(pattern.key)"
            >
                <span
                    v-if="!isImage && current.patternKey === pattern.key"
                    class="pointer-events-none absolute -inset-1 rounded-xl border-2 border-converse-accent"
                />
                <svg
                    v-if="isImage"
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    class="pointer-events-none absolute inset-0 m-auto text-converse-textMuted"
                >
                    <path d="M4 4l16 16" />
                </svg>
            </button>
        </div>

        <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-converse-textDim">
            Color
        </p>
        <div class="flex flex-wrap gap-[9px]">
            <button
                v-for="color in WALLPAPER_COLORS"
                :key="color.key"
                type="button"
                :title="color.label"
                class="relative h-8 w-8 rounded-full border border-converse-border"
                :style="{ backgroundColor: color.css ?? 'transparent' }"
                @click="pickColor(color.key)"
            >
                <span
                    v-if="!isImage && current.colorKeyOrHex === color.key"
                    class="pointer-events-none absolute -inset-1 rounded-full border-2 border-converse-accent"
                />
            </button>
            <div ref="colorMenuRoot" data-menu-root="1" class="relative">
                <button
                    type="button"
                    class="relative h-8 w-8 rounded-full border border-converse-border"
                    title="Custom color"
                    :style="{ backgroundColor: isCustomHex ? current.colorKeyOrHex : 'transparent' }"
                    @click="toggleColorMenu"
                >
                    <svg
                        v-if="!isCustomHex"
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="pointer-events-none absolute inset-0 m-auto text-converse-textMuted"
                    >
                        <path d="M12 3c-3.5 4-6.5 8-6.5 11.5a6.5 6.5 0 0 0 13 0C18.5 11 15.5 7 12 3Z" />
                    </svg>
                    <span
                        v-if="!isImage && isCustomHex"
                        class="pointer-events-none absolute -inset-1 rounded-full border-2 border-converse-accent"
                    />
                </button>

                <div
                    v-if="showColorMenu"
                    class="cv-animate-pop-in absolute right-0 z-20 w-[190px] overflow-y-auto rounded-[22px] border border-converse-border bg-converse-surface p-3 shadow-lg"
                    :class="colorMenuOpenUp ? 'bottom-full mb-1' : 'top-full mt-1'"
                    :style="{ maxHeight: colorMenuMaxHeight + 'px' }"
                >
                    <input
                        type="color"
                        :value="customBaseHex"
                        class="h-9 w-full cursor-pointer rounded-lg border border-converse-border bg-transparent"
                        @input="pickCustomColor"
                    />
                    <input
                        v-model="hexDraft"
                        type="text"
                        maxlength="7"
                        placeholder="#rrggbb"
                        class="mt-2 h-8 w-full rounded-lg border border-converse-border bg-converse-surfaceHover px-2 text-center text-xs uppercase tracking-wide text-converse-text outline-none focus:border-converse-accent"
                        @input="onHexDraftInput"
                    />
                </div>
            </div>
            <button
                type="button"
                title="Upload photo"
                class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 disabled:opacity-50"
                :class="isImage ? 'border-converse-accent' : 'border-converse-border'"
                :disabled="uploadingImage"
                @click="pickImage"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.25"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-converse-textMuted"
                >
                    <rect x="3" y="4" width="18" height="16" rx="4" />
                    <circle cx="8.5" cy="9.5" r="1.4" />
                    <path d="M4 17l4.5-5 4 4 2.5-2.5L20 17" />
                </svg>
            </button>
            <input
                ref="imageInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onImageChange"
            />
        </div>
    </div>
</template>
