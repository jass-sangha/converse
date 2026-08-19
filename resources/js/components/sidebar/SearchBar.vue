<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    autofocus: { type: Boolean, default: true },
    placeholder: { type: String, default: 'Search chats and messages' },
});

const emit = defineEmits(['query']);

const query = ref('');
let debounceTimer = null;

watch(query, (value) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => emit('query', value.trim()), 250);
});
</script>

<template>
    <div class="chat-search-bar px-4 pb-3">
        <div class="relative">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-riwaaq-textMuted"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>
            <input
                v-model="query"
                type="text"
                :autofocus="autofocus"
                :placeholder="placeholder"
                class="chat-search-bar__input h-11 w-full rounded-full border border-riwaaq-border bg-riwaaq-surfaceHover pl-10 pr-4 text-sm text-riwaaq-text focus:outline-none"
            >
        </div>
    </div>
</template>
