<script setup>
import { ref, watch } from 'vue';
import Icon from '../shared/Icon.vue';

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
            <Icon name="search-outline" :size="16" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-riwaaq-textMuted" />
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
