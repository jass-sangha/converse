<script setup>
import { computed } from 'vue';
import { useChatStore } from '../../store';
import { useSidebarUi } from '../../composables/useSidebarUi';
import Icon from '../shared/Icon.vue';

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
        class="chat-mobile-tab-bar flex shrink-0 items-stretch gap-0.5 border-t border-riwaaq-border bg-riwaaq-surface px-3 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 sm:hidden"
    >
        <button
            type="button"
            title="Chats"
            class="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1"
            :class="view === 'chats' ? 'text-riwaaq-accent' : 'text-riwaaq-textMuted'"
            @click="openChats"
        >
            <span class="relative flex h-7 w-[52px] items-center justify-center rounded-full" :class="view === 'chats' ? 'bg-riwaaq-accent/15' : ''">
                <Icon name="chat-bubble" :size="20" />
                <span
                    v-if="unreadCount > 0"
                    class="absolute -top-0.5 right-1 min-w-[17px] rounded-full bg-riwaaq-accent px-1 text-center text-[10px] font-bold leading-[17px] text-riwaaq-accentContrast"
                >{{ unreadCount }}</span>
            </span>
            <span class="text-[10.5px] font-semibold">Chats</span>
        </button>

        <button
            type="button"
            title="Media"
            class="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1"
            :class="view === 'media' ? 'text-riwaaq-accent' : 'text-riwaaq-textMuted'"
            @click="openMedia"
        >
            <span class="flex h-7 w-[52px] items-center justify-center rounded-full" :class="view === 'media' ? 'bg-riwaaq-accent/15' : ''">
                <Icon name="gallery" :size="20" />
            </span>
            <span class="text-[10.5px] font-semibold">Media</span>
        </button>

        <button
            type="button"
            title="Profile"
            class="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1"
            :class="view === 'profile' ? 'text-riwaaq-accent' : 'text-riwaaq-textMuted'"
            @click="openProfile"
        >
            <span class="flex h-7 w-[52px] items-center justify-center rounded-full" :class="view === 'profile' ? 'bg-riwaaq-accent/15' : ''">
                <Icon name="settings" :size="20" />
            </span>
            <span class="text-[10.5px] font-semibold">Profile</span>
        </button>
    </nav>
</template>
