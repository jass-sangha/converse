<script setup>
import { computed } from "vue";
import { resolveWallpaper } from "../../wallpapers";
import { usePreferences } from "../../composables/usePreferences";

const { defaultWallpaper } = usePreferences();
const wallpaper = computed(() => resolveWallpaper(defaultWallpaper.value));
</script>

<template>
    <div
        class="cv-profile-empty-state relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden bg-converse-chatBg p-6 text-center"
    >
        <div
            class="pointer-events-none absolute inset-0"
            :style="{
                backgroundImage: wallpaper.backgroundImage ?? undefined,
                backgroundSize: wallpaper.backgroundSize ?? undefined,
                backgroundPosition: wallpaper.backgroundPosition ?? undefined,
                backgroundRepeat: wallpaper.backgroundRepeat ?? undefined,
            }"
        />
        <span
            class="relative flex h-16 w-16 items-center justify-center rounded-full bg-converse-surface text-converse-textMuted shadow-sm"
        >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.87 0-8 1.95-8 5v2h16v-2c0-3.05-4.13-5-8-5Z" />
            </svg>
        </span>
        <p class="relative text-sm text-converse-textMuted">
            This is your profile. Manage your name, photo, and settings from the panel on the left.
        </p>
    </div>
</template>
