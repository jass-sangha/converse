<script setup>
import { computed } from 'vue';
import { useChatStore } from '../../store';
import { useSidebarUi } from '../../composables/useSidebarUi';

const store = useChatStore();
const { view, setView, setFilter } = useSidebarUi();

const unreadCount = computed(
    () => store.conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0),
);

function openChats() {
    setView('chats');
    setFilter('all');
}

function openMedia() {
    setView('media');
}

function openProfile() {
    setView('profile');
}
</script>

<template>
    <nav
        class="cv-mobile-tab-bar flex shrink-0 items-stretch gap-0.5 border-t border-converse-border bg-converse-surface px-3 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 sm:hidden"
    >
        <button
            type="button"
            title="Chats"
            class="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1"
            :class="view === 'chats' ? 'text-converse-accent' : 'text-converse-textMuted'"
            @click="openChats"
        >
            <span class="relative flex h-7 w-[52px] items-center justify-center rounded-full" :class="view === 'chats' ? 'bg-converse-accent/15' : ''">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" /></svg>
                <span
                    v-if="unreadCount > 0"
                    class="absolute -top-0.5 right-1 min-w-[17px] rounded-full bg-converse-accent px-1 text-center text-[10px] font-bold leading-[17px] text-converse-accentContrast"
                >{{ unreadCount }}</span>
            </span>
            <span class="text-[10.5px] font-semibold">Chats</span>
        </button>

        <button
            type="button"
            title="Media"
            class="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1"
            :class="view === 'media' ? 'text-converse-accent' : 'text-converse-textMuted'"
            @click="openMedia"
        >
            <span class="flex h-7 w-[52px] items-center justify-center rounded-full" :class="view === 'media' ? 'bg-converse-accent/15' : ''">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="4" /><circle cx="9" cy="10" r="1.8" /><path d="m4 17 5-4 4 3 3-2 4 3" /></svg>
            </span>
            <span class="text-[10.5px] font-semibold">Media</span>
        </button>

        <button
            type="button"
            title="Profile"
            class="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1"
            :class="view === 'profile' ? 'text-converse-accent' : 'text-converse-textMuted'"
            @click="openProfile"
        >
            <span class="flex h-7 w-[52px] items-center justify-center rounded-full" :class="view === 'profile' ? 'bg-converse-accent/15' : ''">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2" /><path d="M19.4 14.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-3-1.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0-1.2-2.9h-.2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.3-3l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 2.9-1.2v-.2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 3 1.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" /></svg>
            </span>
            <span class="text-[10.5px] font-semibold">Profile</span>
        </button>
    </nav>
</template>
