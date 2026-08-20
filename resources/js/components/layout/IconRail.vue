<script setup>
import { computed } from "vue";
import Avatar from "../shared/Avatar.vue";
import Icon from "../shared/Icon.vue";
import { useChatStore } from "../../store";
import { useSidebarUi } from "../../composables/useSidebarUi";

const store = useChatStore();
const { view, setView, setFilter } = useSidebarUi();

const me = computed(() => store.usersById[store.currentKey] ?? null);

const unreadCount = computed(() =>
    store.conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0),
);

const isChats = computed(() => view.value === "chats");
const isMedia = computed(() => view.value === "media");
const isProfile = computed(() => view.value === "profile");

function openChats() {
    setView("chats");
    setFilter("all");
}

function openMedia() {
    setView("media");
}

function openProfile() {
    setView("profile");
}
</script>

<template>
    <nav
        class="chat-icon-rail flex h-full w-[72px] shrink-0 flex-col items-center gap-1.5 border-r border-riwaaq-border bg-riwaaq-railBg pb-4 pt-[18px]"
    >
        <button
            type="button"
            title="Chats"
            class="chat-icon-rail__button relative flex h-[46px] w-[46px] items-center justify-center rounded-2xl"
            :class="
                isChats
                    ? 'text-riwaaq-accentContrast'
                    : 'text-riwaaq-textMuted hover:bg-riwaaq-sageTint hover:text-riwaaq-sageText'
            "
            @click="openChats"
        >
            <div
                v-if="isChats"
                class="absolute inset-0 rounded-2xl bg-riwaaq-accent"
            />
                <Icon name="chat-bubble-alt" :size="23" class="relative" />
            <span
                v-if="unreadCount > 0"
                class="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-riwaaq-sage px-[5px] text-[10.5px] font-bold text-white"
                >{{ unreadCount }}</span
            >
        </button>

        <button
            type="button"
            title="Media"
            class="chat-icon-rail__button relative flex h-[46px] w-[46px] items-center justify-center rounded-2xl text-riwaaq-textMuted hover:bg-riwaaq-sageTint hover:text-riwaaq-sageText"
            @click="openMedia"
        >
            <div
                v-if="isMedia"
                class="absolute inset-0 rounded-2xl bg-riwaaq-bubbleOut"
            />
                <Icon name="image-alt" :size="23" class="relative" />
        </button>

        <button
            type="button"
            title="You"
            class="chat-icon-rail__button relative mt-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            @click="openProfile"
        >
            <div
                v-if="isProfile"
                class="absolute inset-0 rounded-full border-[2.5px] border-riwaaq-accent"
            />
            <Avatar
                :name="me?.name ?? ''"
                :avatar-url="me?.avatar_url"
                :size="38"
            />
        </button>
    </nav>
</template>
