<script setup>
defineProps({
    title: { type: String, required: true },
});

const emit = defineEmits(["back"]);
</script>

<template>
    <div
        class="cv-sidebar-screen-header flex shrink-0 items-center gap-3 border-b border-converse-border px-3 py-3"
    >
        <button
            type="button"
            title="Back"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
            @click="emit('back')"
        >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path
                    d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20Z"
                />
            </svg>
        </button>
        <h1 class="flex-1 truncate text-lg font-semibold text-converse-text">
            {{ title }}
        </h1>
        <slot />
    </div>
</template>
