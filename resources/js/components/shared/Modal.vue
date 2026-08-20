<script setup>
import { onBeforeUnmount, onMounted } from 'vue';

defineProps({
    title: { type: String, default: '' },
});

const emit = defineEmits(['close']);

function onKeydown(event) {
    if (event.key === 'Escape') {
        emit('close');
    }
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
    <div class="chat-modal-backdrop chat-animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-riwaaq-overlay/50" @click.self="emit('close')">
        <div class="chat-modal-panel chat-animate-scale-in flex max-h-[85vh] w-full max-w-md flex-col rounded-chat bg-riwaaq-surface shadow-chat-lg">
            <div class="chat-modal-header flex items-center justify-between border-b border-riwaaq-border px-4 py-3">
                <h2 class="font-medium text-riwaaq-text">{{ title }}</h2>
                <button type="button" class="chat-modal-close text-riwaaq-textMuted hover:text-riwaaq-text" @click="emit('close')">×</button>
            </div>
            <div class="chat-modal-body flex-1 overflow-y-auto p-4">
                <slot />
            </div>
            <div v-if="$slots.footer" class="chat-modal-footer border-t border-riwaaq-border px-4 py-3">
                <slot name="footer" />
            </div>
        </div>
    </div>
</template>
