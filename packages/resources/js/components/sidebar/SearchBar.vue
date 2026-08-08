<script setup>
import { ref, watch } from 'vue';
import { useConversations } from '../../composables/useConversations';

const emit = defineEmits(['message-search']);

const query = ref('');
const mode = ref('conversations');
const { refresh } = useConversations();
let debounceTimer = null;

watch(query, (value) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (mode.value === 'conversations') {
            refresh(value ? { q: value } : {});
        } else {
            emit('message-search', value);
        }
    }, 250);
});

function toggleMode() {
    mode.value = mode.value === 'conversations' ? 'messages' : 'conversations';
    query.value = '';
    refresh();
}
</script>

<template>
    <div class="cv-search-bar flex items-center gap-2 border-b border-converse-border p-2">
        <input
            v-model="query"
            type="text"
            :placeholder="mode === 'conversations' ? 'Search chats' : 'Search messages'"
            class="cv-search-bar__input flex-1 rounded-full bg-converse-surfaceHover px-3 py-1.5 text-sm focus:outline-none"
        >
        <button
            type="button"
            class="cv-search-bar__toggle whitespace-nowrap text-xs text-converse-accent"
            @click="toggleMode"
        >
            {{ mode === 'conversations' ? 'Search messages' : 'Search chats' }}
        </button>
    </div>
</template>
