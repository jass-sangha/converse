<script setup>
import { computed } from "vue";
import Avatar from "../shared/Avatar.vue";
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
        class="cv-icon-rail flex h-full w-[72px] shrink-0 flex-col items-center gap-1.5 border-r border-converse-border bg-converse-railBg pb-4 pt-[18px]"
    >
        <button
            type="button"
            title="Chats"
            class="cv-icon-rail__button relative flex h-[46px] w-[46px] items-center justify-center rounded-2xl"
            :class="
                isChats
                    ? 'text-converse-accentContrast'
                    : 'text-converse-textMuted hover:bg-converse-sageTint hover:text-converse-sageText'
            "
            @click="openChats"
        >
            <div
                v-if="isChats"
                class="absolute inset-0 rounded-2xl bg-converse-accent"
            />
            <svg
                viewBox="0 0 24 24"
                width="23"
                height="23"
                fill="none"
                stroke="currentColor"
                stroke-width="2.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="relative"
            >
                <path
                    d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-2.8-.4L4 21l1.6-4.2A8.3 8.3 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"
                />
            </svg>
            <span
                v-if="unreadCount > 0"
                class="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-converse-sage px-[5px] text-[10.5px] font-bold text-white"
                >{{ unreadCount }}</span
            >
        </button>

        <button
            type="button"
            title="Media"
            class="cv-icon-rail__button relative flex h-[46px] w-[46px] items-center justify-center rounded-2xl text-converse-textMuted hover:bg-converse-sageTint hover:text-converse-sageText"
            @click="openMedia"
        >
            <div
                v-if="isMedia"
                class="absolute inset-0 rounded-2xl bg-converse-bubbleOut"
            />
            <svg
                viewBox="0 0 24 24"
                width="23"
                height="23"
                fill="none"
                stroke="currentColor"
                stroke-width="2.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="relative"
            >
                <rect x="3" y="4" width="18" height="16" rx="4" />
                <circle cx="8.5" cy="9.5" r="1.6" />
                <path d="M4 17l4.5-5 4 4 2.5-2.5L20 17" />
            </svg>
        </button>

        <button
            type="button"
            title="You"
            class="cv-icon-rail__button relative mt-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            @click="openProfile"
        >
            <div
                v-if="isProfile"
                class="absolute inset-0 rounded-full border-[2.5px] border-converse-accent"
            />
            <Avatar
                :name="me?.name ?? ''"
                :avatar-url="me?.avatar_url"
                :size="38"
            />
        </button>
    </nav>
</template>
