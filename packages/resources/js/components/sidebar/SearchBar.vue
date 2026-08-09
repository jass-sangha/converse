<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    autofocus: { type: Boolean, default: true },
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
    <div class="cv-search-bar px-3 pb-2">
        <div class="relative">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-converse-textMuted"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"/></svg>
            <input
                v-model="query"
                type="text"
                :autofocus="autofocus"
                placeholder="Search or start a new chat"
                class="cv-search-bar__input w-full rounded-lg bg-converse-surfaceHover py-2 pl-9 pr-3 text-sm text-converse-text focus:outline-none"
            >
        </div>
    </div>
</template>
