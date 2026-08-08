<script setup>
defineProps({
    title: { type: String, default: '' },
});

const emit = defineEmits(['close']);
</script>

<template>
    <div class="cv-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-converse-overlay/50" @click.self="emit('close')">
        <div class="cv-modal-panel flex max-h-[85vh] w-full max-w-md flex-col rounded-cv bg-converse-surface shadow-xl">
            <div class="cv-modal-header flex items-center justify-between border-b border-converse-border px-4 py-3">
                <h2 class="font-medium text-converse-text">{{ title }}</h2>
                <button type="button" class="cv-modal-close text-converse-textMuted hover:text-converse-text" @click="emit('close')">×</button>
            </div>
            <div class="cv-modal-body flex-1 overflow-y-auto p-4">
                <slot />
            </div>
            <div v-if="$slots.footer" class="cv-modal-footer border-t border-converse-border px-4 py-3">
                <slot name="footer" />
            </div>
        </div>
    </div>
</template>
