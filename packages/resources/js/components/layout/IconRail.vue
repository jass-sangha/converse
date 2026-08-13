<script setup>
import { computed } from "vue";
import Avatar from "../shared/Avatar.vue";
import { useChatStore } from "../../store";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { usePreferences } from "../../composables/usePreferences";

const store = useChatStore();
const { view, setView, setFilter } = useSidebarUi();
const { theme, effectiveTheme, setTheme } = usePreferences();

const me = computed(() => store.usersById[store.currentKey] ?? null);

const unreadCount = computed(
    () => store.conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0),
);

const isChats = computed(() => view.value === "chats");
const isMedia = computed(() => view.value === "media");
const isProfile = computed(() => view.value === "profile");

const themeTitle = computed(() => `Theme: ${theme.value} — click to change`);

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

function cycleTheme() {
    const next = theme.value === "light" ? "dark" : theme.value === "dark" ? "system" : "light";
    setTheme(next);
}
</script>

<template>
    <nav
        class="cv-icon-rail flex w-[72px] shrink-0 flex-col items-center gap-1.5 border-r border-converse-border bg-converse-railBg pb-4 pt-[18px]"
    >
        <div
            class="font-display mb-3.5 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-converse-accent text-[19px] text-converse-accentContrast"
        >
            C
        </div>

        <button
            type="button"
            title="Chats"
            class="cv-icon-rail__button relative flex h-[46px] w-[46px] items-center justify-center rounded-2xl"
            :class="isChats ? 'text-converse-accentContrast' : 'text-converse-textMuted hover:bg-converse-sage/15 hover:text-converse-sage'"
            @click="openChats"
        >
            <div v-if="isChats" class="absolute inset-0 rounded-2xl bg-converse-accent" />
            <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" class="relative">
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-2.8-.4L4 21l1.6-4.2A8.3 8.3 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
            </svg>
            <span
                v-if="unreadCount > 0"
                class="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-converse-sage px-1 text-[10.5px] font-bold text-converse-sageContrast"
            >{{ unreadCount }}</span>
        </button>

        <button
            type="button"
            title="Media"
            class="cv-icon-rail__button relative flex h-[46px] w-[46px] items-center justify-center rounded-2xl text-converse-textMuted hover:bg-converse-sage/15 hover:text-converse-sage"
            @click="openMedia"
        >
            <div v-if="isMedia" class="absolute inset-0 rounded-2xl bg-converse-bubbleOut" />
            <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" class="relative">
                <rect x="3" y="4" width="18" height="16" rx="4" />
                <circle cx="8.5" cy="9.5" r="1.6" />
                <path d="M4 17l4.5-5 4 4 2.5-2.5L20 17" />
            </svg>
        </button>

        <button
            type="button"
            :title="themeTitle"
            class="cv-icon-rail__button relative flex h-[46px] w-[46px] items-center justify-center rounded-2xl text-converse-textMuted hover:bg-converse-sage/15 hover:text-converse-sage"
            @click="cycleTheme"
        >
            <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
            </svg>
            <svg v-else-if="theme === 'system'" viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4.5" width="18" height="12" rx="2.5" />
                <path d="M9 20h6M12 16.5V20" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3.6" />
                <path d="M12 2.6v2M12 19.4v2M3.9 3.9l1.4 1.4M18.7 18.7l1.4 1.4M2.6 12h2M19.4 12h2M3.9 20.1l1.4-1.4M18.7 5.3l1.4-1.4" />
            </svg>
        </button>

        <button
            type="button"
            title="You"
            class="cv-icon-rail__button relative mt-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            @click="openProfile"
        >
            <div v-if="isProfile" class="absolute inset-0 rounded-full border-2 border-converse-accent" />
            <Avatar :name="me?.name ?? ''" :avatar-url="me?.avatar_url" :size="38" />
        </button>
    </nav>
</template>
