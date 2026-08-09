<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ConversationListItem from './ConversationListItem.vue';
import SearchBar from './SearchBar.vue';
import NewChatModal from './NewChatModal.vue';
import NewGroupModal from './NewGroupModal.vue';
import StarredMessagesPanel from '../panels/StarredMessagesPanel.vue';
import BlockedUsersPanel from '../panels/BlockedUsersPanel.vue';
import { useConversations } from '../../composables/useConversations';
import { usePreferences } from '../../composables/usePreferences';
import { useSidebarUi } from '../../composables/useSidebarUi';
import { useChatStore } from '../../store';

const emit = defineEmits(['message-search']);

const store = useChatStore();
const { refresh, setActive } = useConversations();
const { theme, toggleTheme } = usePreferences();
const { filter, setFilter, searchOpen, toggleSearch, setView } = useSidebarUi();

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'favourites', label: 'Favourites' },
    { key: 'groups', label: 'Groups' },
];

const showNewChat = ref(false);
const showNewGroup = ref(false);
const showArchived = ref(false);
const showStarred = ref(false);
const showBlocked = ref(false);
const showMenu = ref(false);
const menuRoot = ref(null);

onMounted(() => refresh());

function onDocumentClick(event) {
    if (menuRoot.value && !menuRoot.value.contains(event.target)) {
        showMenu.value = false;
    }
}

watch(showMenu, (open) => {
    if (open) {
        document.addEventListener('click', onDocumentClick);
    } else {
        document.removeEventListener('click', onDocumentClick);
    }
});

onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick));

function toggleArchived() {
    showArchived.value = !showArchived.value;
    refresh(showArchived.value ? { archived: true } : {});
}

function select(conversationId) {
    setActive(conversationId);
}

function isPinned(conversation) {
    return !!(conversation.pinned_at || conversation.me?.pinned_at);
}

const filteredConversations = computed(() => {
    switch (filter.value) {
        case 'unread':
            return store.conversations.filter((c) => c.unread_count > 0);
        case 'favourites':
            return store.conversations.filter(isPinned);
        case 'groups':
            return store.conversations.filter((c) => c.type === 'group');
        default:
            return store.conversations;
    }
});
</script>

<template>
    <div class="cv-conversation-list flex h-full flex-col bg-converse-surface">
        <div class="cv-conversation-list__header flex items-center justify-between px-4 py-3">
            <h1 class="text-xl font-bold text-converse-text">WhatsApp</h1>

            <div class="cv-conversation-list__actions flex items-center gap-1">
                <button
                    type="button"
                    title="Search"
                    class="flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                    @click="toggleSearch"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"/></svg>
                </button>
                <button
                    type="button"
                    title="New chat"
                    class="flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                    @click="showNewChat = true"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.49 3.51a3 3 0 0 0-4.24 0L5 14.76V19h4.24L20.49 7.75a3 3 0 0 0 0-4.24ZM4 21h16v-1.5H4Z"/></svg>
                </button>

                <div ref="menuRoot" class="relative">
                    <button
                        type="button"
                        title="Menu"
                        class="flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                        @click="showMenu = !showMenu"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>
                    </button>

                    <div
                        v-if="showMenu"
                        class="cv-conversation-list__menu absolute right-0 top-full z-20 w-56 rounded-cv border border-converse-border bg-converse-surface py-1 text-sm shadow-lg"
                    >
                        <button type="button" class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover" @click="showNewGroup = true; showMenu = false">New group</button>
                        <button type="button" class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover" @click="showStarred = true; showMenu = false">Starred messages</button>
                        <button type="button" class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover" @click="showBlocked = true; showMenu = false">Blocked contacts</button>
                        <button type="button" class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover" @click="toggleArchived(); showMenu = false">{{ showArchived ? 'Back to chats' : 'Archived chats' }}</button>
                        <button type="button" class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover" @click="toggleTheme(); showMenu = false">{{ theme === 'dark' ? 'Light mode' : 'Dark mode' }}</button>
                        <button type="button" class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover" @click="setView('profile'); showMenu = false">Settings</button>
                    </div>
                </div>
            </div>
        </div>

        <SearchBar v-if="searchOpen" @message-search="(q) => emit('message-search', q)" />

        <div v-else class="cv-conversation-list__filters flex items-center gap-2 overflow-x-auto px-3 pb-2">
            <button
                v-for="f in FILTERS"
                :key="f.key"
                type="button"
                class="shrink-0 rounded-full px-3 py-1 text-sm font-medium"
                :class="filter === f.key ? 'bg-converse-accent/15 text-converse-accent' : 'bg-converse-surfaceHover text-converse-text hover:bg-converse-border/50'"
                @click="setFilter(f.key)"
            >
                {{ f.label }}
            </button>
            <button
                type="button"
                title="New chat"
                class="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-converse-surfaceHover text-converse-textMuted hover:bg-converse-border/50"
                @click="showNewChat = true"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z"/></svg>
            </button>
        </div>

        <ul class="cv-conversation-list__items flex-1 overflow-y-auto">
            <ConversationListItem
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                :conversation="conversation"
                :active="conversation.id === store.activeConversationId"
                @select="select"
            />
            <li v-if="!filteredConversations.length" class="cv-conversation-list__empty p-4 text-center text-sm text-converse-textMuted">
                No conversations here.
            </li>
        </ul>

        <NewChatModal v-if="showNewChat" @close="showNewChat = false" />
        <NewGroupModal v-if="showNewGroup" @close="showNewGroup = false" />
        <StarredMessagesPanel v-if="showStarred" @close="showStarred = false" />
        <BlockedUsersPanel v-if="showBlocked" @close="showBlocked = false" />
    </div>
</template>
