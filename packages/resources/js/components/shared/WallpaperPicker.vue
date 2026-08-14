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

const { uploadAttachment } = useMessages();
const imageInput = ref(null);
const uploadingImage = ref(false);

const current = computed(() => decodeWallpaper(props.modelValue));
const isImage = computed(() => current.value.colorKeyOrHex?.startsWith("image:"));

function pickPattern(patternKey) {
    emit("update:modelValue", encodeWallpaper(patternKey, current.value.colorKeyOrHex));
}

function pickColor(colorKey) {
    emit("update:modelValue", encodeWallpaper(current.value.patternKey, colorKey));
}

function pickCustomColor(event) {
    emit("update:modelValue", encodeWallpaper(current.value.patternKey, event.target.value));
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
        emit("update:modelValue", encodeWallpaper("none", `image:${attachment.url}`));
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
                class="relative h-8 w-8 rounded-[10px] border border-converse-border bg-converse-surfaceHover"
                :class="{ 'opacity-50': isImage }"
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
            >
                <input
                    type="color"
                    class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    @input="pickCustomColor"
                />
                <span class="pointer-events-none absolute inset-0 flex items-center justify-center text-xs"
                    >🎨</span
                >
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
