<script setup>
import Icon from "./Icon.vue";

defineProps({
    title: { type: String, required: true },
});

const emit = defineEmits(["back"]);
</script>

<template>
    <div
        class="chat-sidebar-screen-header flex shrink-0 items-center gap-3 px-3 py-3"
    >
        <button
            type="button"
            title="Back"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover"
            @click="emit('back')"
        >
            <Icon name="back-arrow" :size="20" />
        </button>
        <h1 class="flex-1 truncate text-lg font-semibold text-riwaaq-text">
            {{ title }}
        </h1>
        <slot />
    </div>
</template>
