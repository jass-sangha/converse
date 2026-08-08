<script setup>
import { ref, onMounted } from 'vue';
import ConversationListItem from './ConversationListItem.vue';
import SearchBar from './SearchBar.vue';
import NewChatModal from './NewChatModal.vue';
import NewGroupModal from './NewGroupModal.vue';
import StarredMessagesPanel from '../panels/StarredMessagesPanel.vue';
import BlockedUsersPanel from '../panels/BlockedUsersPanel.vue';
import { useConversations } from '../../composables/useConversations';
import { usePreferences } from '../../composables/usePreferences';
import { useChatStore } from '../../store';

const emit = defineEmits(['message-search', 'open-settings']);

const store = useChatStore();
const { refresh, setActive } = useConversations();
const { theme, toggleTheme } = usePreferences();

const showNewChat = ref(false);
const showNewGroup = ref(false);
const showArchived = ref(false);
const showStarred = ref(false);
const showBlocked = ref(false);

onMounted(() => refresh());

function toggleArchived() {
    showArchived.value = !showArchived.value;
    refresh(showArchived.value ? { archived: true } : {});
}

function select(conversationId) {
    setActive(conversationId);
}
</script>

<template>
    <div class="cv-conversation-list flex h-full flex-col bg-converse-surface">
        <div class="cv-conversation-list__header flex items-center justify-between border-b border-converse-border px-3 py-2">
            <h1 class="font-semibold text-converse-text">Chats</h1>
            <div class="cv-conversation-list__actions flex gap-2 text-sm">
                <button type="button" title="Toggle theme" @click="toggleTheme">{{ theme === 'dark' ? '🌙' : '☀️' }}</button>
                <button type="button" title="Starred messages" @click="showStarred = true">⭐</button>
                <button type="button" title="Blocked users" @click="showBlocked = true">🚫</button>
                <button type="button" title="Settings" @click="emit('open-settings')">⚙️</button>
                <button type="button" class="text-converse-accent" @click="showNewChat = true">New chat</button>
                <button type="button" class="text-converse-accent" @click="showNewGroup = true">New group</button>
            </div>
        </div>

        <SearchBar @message-search="(q) => emit('message-search', q)" />

        <button
            type="button"
            class="cv-conversation-list__archived-toggle border-b border-converse-border px-3 py-1.5 text-left text-xs text-converse-textMuted hover:bg-converse-surfaceHover"
            @click="toggleArchived"
        >
            {{ showArchived ? '← Back to chats' : 'Archived chats →' }}
        </button>

        <ul class="cv-conversation-list__items flex-1 overflow-y-auto">
            <ConversationListItem
                v-for="conversation in store.conversations"
                :key="conversation.id"
                :conversation="conversation"
                :active="conversation.id === store.activeConversationId"
                @select="select"
            />
            <li v-if="!store.conversations.length" class="cv-conversation-list__empty p-4 text-center text-sm text-converse-textMuted">
                No conversations yet.
            </li>
        </ul>

        <NewChatModal v-if="showNewChat" @close="showNewChat = false" />
        <NewGroupModal v-if="showNewGroup" @close="showNewGroup = false" />
        <StarredMessagesPanel v-if="showStarred" @close="showStarred = false" />
        <BlockedUsersPanel v-if="showBlocked" @close="showBlocked = false" />
    </div>
</template>
