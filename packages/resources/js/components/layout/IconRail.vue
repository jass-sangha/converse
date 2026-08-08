<script setup>
import { computed } from 'vue';
import Avatar from '../shared/Avatar.vue';
import { useChatStore } from '../../store';
import { useSidebarUi } from '../../composables/useSidebarUi';

const emit = defineEmits(['open-profile']);

const store = useChatStore();
const { view, setView, setFilter } = useSidebarUi();

const me = computed(() => store.usersById[store.currentKey] ?? null);

function openChats() {
    setView('chats');
}

function openGroups() {
    setView('chats');
    setFilter('groups');
}

function openMedia() {
    setView('media');
}
</script>

<template>
    <nav class="cv-icon-rail flex w-14 shrink-0 flex-col items-center gap-1 border-r border-converse-border bg-converse-railBg py-3">
        <button
            type="button"
            title="Chats"
            class="cv-icon-rail__button flex h-10 w-10 items-center justify-center rounded-lg"
            :class="view === 'chats' ? 'bg-converse-accent/15 text-converse-accent' : 'text-converse-textMuted hover:bg-converse-surfaceHover'"
            @click="openChats"
        >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.4 1.05 4.58 2.77 6.2-.15 1.34-.72 2.55-1.55 3.5a.5.5 0 0 0 .5.8c1.9-.32 3.55-1.18 4.86-2.27C9.5 19.72 10.72 20 12 20c5.52 0 10-4.03 10-9s-4.48-9-10-9Z"/></svg>
        </button>

        <button
            type="button"
            title="Groups"
            class="cv-icon-rail__button flex h-10 w-10 items-center justify-center rounded-lg"
            :class="view === 'chats' ? 'text-converse-textMuted hover:bg-converse-surfaceHover' : 'text-converse-textMuted hover:bg-converse-surfaceHover'"
            @click="openGroups"
        >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 3c-3.31 0-6 1.79-6 4v2h12v-2c0-2.21-2.69-4-6-4Zm7 0c-.34 0-.68.02-1 .07 1.24.91 2 2.16 2 3.93v2h5v-2c0-2.03-2.66-3.65-6-4Z"/></svg>
        </button>

        <button
            type="button"
            title="Media"
            class="cv-icon-rail__button flex h-10 w-10 items-center justify-center rounded-lg"
            :class="view === 'media' ? 'bg-converse-accent/15 text-converse-accent' : 'text-converse-textMuted hover:bg-converse-surfaceHover'"
            @click="openMedia"
        >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-9 11 2.5-3 3.5 4.5H6l3-4Zm-3-5.5A1.5 1.5 0 1 1 8 8a1.5 1.5 0 0 1 0 1.5Z"/></svg>
        </button>

        <button
            type="button"
            title="Profile"
            class="cv-icon-rail__button mt-auto flex h-10 w-10 items-center justify-center rounded-full hover:ring-2 hover:ring-converse-border"
            @click="emit('open-profile')"
        >
            <Avatar :name="me?.name ?? ''" :avatar-url="me?.avatar_url" :size="32" />
        </button>
    </nav>
</template>
