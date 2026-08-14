<script setup>
import { computed, ref } from "vue";
import {
    WALLPAPER_PATTERNS,
    WALLPAPER_COLORS,
    decodeWallpaper,
    encodeWallpaper,
} from "../../wallpapers";
import { useMessages } from "../../composables/useMessages";

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

function pickCustomColor(event) {
    const hex = hexWithAlpha(event.target.value, CUSTOM_COLOR_OPACITY);
    emit("update:modelValue", encodeWallpaper(current.value.patternKey, hex));
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
                    backgroundImage: pattern.image ?? 'none',
                    backgroundSize: pattern.size ?? 'auto',
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
            <label
                class="relative h-8 w-8 cursor-pointer rounded-full border border-converse-border"
                title="Custom color"
                :style="{ backgroundColor: isCustomHex ? current.colorKeyOrHex : 'transparent' }"
            >
                <input
                    type="color"
                    :value="customBaseHex"
                    class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    @input="pickCustomColor"
                />
                <span
                    v-if="!isCustomHex"
                    class="pointer-events-none absolute inset-0 flex items-center justify-center text-xs"
                    >🎨</span
                >
                <span
                    v-if="!isImage && isCustomHex"
                    class="pointer-events-none absolute -inset-1 rounded-full border-2 border-converse-accent"
                />
            </label>
            <button
                type="button"
                title="Upload photo"
                class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 disabled:opacity-50"
                :class="isImage ? 'border-converse-accent' : 'border-converse-border'"
                :disabled="uploadingImage"
                @click="pickImage"
            >
                <span class="text-xs">🖼️</span>
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
