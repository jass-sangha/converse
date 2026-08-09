<script setup>
import { computed, nextTick, ref, watch, onUnmounted } from 'vue';
import ChatHeader from './ChatHeader.vue';
import MessageList from './MessageList.vue';
import MessageBubble from './MessageBubble.vue';
import MessageComposer from '../composer/MessageComposer.vue';
import GroupInfoPanel from '../panels/GroupInfoPanel.vue';
import { useChatStore } from '../../store';
import { useConversations } from '../../composables/useConversations';
import { useMessages } from '../../composables/useMessages';
import { useMessagePins } from '../../composables/useMessagePins';
import { useEcho } from '../../composables/useEcho';
import { useBlockedUsers } from '../../composables/useBlockedUsers';
import { chatableKey, chatableKeyOf } from '../../chatable';

const store = useChatStore();
const { setActive } = useConversations();
const { load, markDelivered, markRead, search } = useMessages();
const { list: listPinned, unpin, pinnedFor } = useMessagePins();
const { unblock } = useBlockedUsers();

const replyTo = ref(null);
const editing = ref(null);
const showInfo = ref(false);
const searchResults = ref([]);
const chatSearchOpen = ref(false);
const chatSearchQuery = ref('');

const conversation = computed(() => store.conversations.find((c) => c.id === store.activeConversationId));
const activeSearchQuery = computed(() => (chatSearchOpen.value ? chatSearchQuery.value : ''));

const otherParticipant = computed(() => {
    if (!conversation.value || conversation.value.type !== 'private') return null;
    const other = (conversation.value.participants ?? []).find((p) => chatableKeyOf(p) !== store.currentKey);
    return other ? { type: other.chatable_type, id: other.chatable_id } : null;
});

const isBlocked = computed(() => (
    !!otherParticipant.value && store.blockedKeys.includes(chatableKey(otherParticipant.value.type, otherParticipant.value.id))
));

async function onUnblock() {
    if (otherParticipant.value) {
        await unblock(otherParticipant.value.type, otherParticipant.value.id);
    }
}

function onToggleChatSearch() {
    chatSearchOpen.value = !chatSearchOpen.value;
    if (!chatSearchOpen.value) chatSearchQuery.value = '';
}

watch(() => store.activeConversationId, async (newId, oldId) => {
    replyTo.value = null;
    editing.value = null;
    showInfo.value = false;

    if (oldId) useEcho().leaveConversation(oldId);

    if (newId) {
        useEcho().joinConversation(newId);
        await load(newId);
        await markDelivered(newId);
        await listPinned(newId);
        const messages = store.messagesByConversation[newId] ?? [];
        if (messages.length) {
            await markRead(newId, messages[messages.length - 1].id);
        }

        if (store.pendingScrollMessageId) {
            const pendingId = store.pendingScrollMessageId;
            store.pendingScrollMessageId = null;
            nextTick(() => scrollToMessage(pendingId));
        }
    }
}, { immediate: true });

// Handles jumping to a message within the conversation that's already open — a switch to a
// different conversation is instead handled inside the activeConversationId watcher above,
// once that conversation's messages have actually loaded into the DOM.
watch(() => store.pendingScrollMessageId, (id) => {
    if (!id) return;

    if (document.getElementById(`cv-message-${id}`)) {
        store.pendingScrollMessageId = null;
        scrollToMessage(id);
    }
});

const pinnedMessages = computed(() => (conversation.value ? pinnedFor(conversation.value.id) : []));

function scrollToMessage(messageId) {
    const el = document.getElementById(`cv-message-${messageId}`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('cv-message-bubble--highlight');
    setTimeout(() => el.classList.remove('cv-message-bubble--highlight'), 1600);
}

async function onUnpinFromBanner(message) {
    await unpin(message);
}

function jumpToResult(message) {
    chatSearchOpen.value = false;
    chatSearchQuery.value = '';
    nextTick(() => scrollToMessage(message.id));
}

watch(activeSearchQuery, async (q) => {
    if (q && conversation.value) {
        searchResults.value = await search(q, conversation.value.id);
    } else {
        searchResults.value = [];
    }
});

onUnmounted(() => {
    if (store.activeConversationId) useEcho().leaveConversation(store.activeConversationId);
});

function onBack() {
    setActive(null);
}

function onReply(message) {
    replyTo.value = message;
    editing.value = null;
}

function onEdit(message) {
    editing.value = message;
    replyTo.value = null;
}
</script>

<template>
    <div v-if="!conversation" class="cv-chat-window-empty flex h-full items-center justify-center bg-converse-chatBg text-converse-textMuted">
        <p>Select a conversation to start chatting.</p>
    </div>

    <div v-else class="cv-chat-window flex h-full">
        <div class="cv-chat-window__main flex h-full flex-1 flex-col">
            <ChatHeader
                :conversation="conversation"
                :search-open="chatSearchOpen"
                @back="onBack"
                @open-info="showInfo = !showInfo"
                @toggle-search="onToggleChatSearch"
            />

            <div v-if="chatSearchOpen" class="cv-chat-window__inline-search flex items-center gap-2 border-b border-converse-border bg-converse-surface px-3 py-2">
                <input
                    v-model="chatSearchQuery"
                    type="text"
                    autofocus
                    placeholder="Search in this chat"
                    class="flex-1 rounded-full bg-converse-surfaceHover px-4 py-1.5 text-sm text-converse-text focus:outline-none"
                    @keydown.escape="onToggleChatSearch"
                >
                <button
                    type="button"
                    title="Close search"
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                    @click="onToggleChatSearch"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.3 5.71 12 12.01l6.3 6.3-1.41 1.41L10.59 13.4l-6.3 6.3-1.41-1.42 6.3-6.3-6.3-6.29L4.3 4.28l6.29 6.3 6.3-6.3Z"/></svg>
                </button>
            </div>

            <div v-if="pinnedMessages.length" class="cv-chat-window__pinned-banner border-b border-converse-border bg-converse-surface">
                <div
                    v-for="pinned in pinnedMessages"
                    :key="pinned.id"
                    class="cv-chat-window__pinned-item flex cursor-pointer items-center gap-2 border-b border-converse-border px-3 py-1.5 last:border-b-0 hover:bg-converse-surfaceHover"
                    @click="scrollToMessage(pinned.id)"
                >
                    <span class="text-xs">📌</span>
                    <span class="flex-1 truncate text-xs text-converse-textMuted">{{ pinned.deleted_for_everyone ? 'This message was deleted' : (pinned.type === 'text' ? pinned.body : `[${pinned.type}]`) }}</span>
                    <button type="button" class="cv-chat-window__pinned-unpin text-xs text-converse-textMuted hover:text-converse-danger" @click.stop="onUnpinFromBanner(pinned)">✕</button>
                </div>
            </div>

            <div v-if="activeSearchQuery" class="cv-chat-window__search-results flex-1 overflow-y-auto bg-converse-chatBg p-3">
                <p class="mb-2 text-xs text-converse-textMuted">Results for "{{ activeSearchQuery }}"</p>
                <div v-for="message in searchResults" :key="message.id" class="cursor-pointer" @click="jumpToResult(message)">
                    <MessageBubble :message="message" />
                </div>
                <p v-if="!searchResults.length" class="text-sm text-converse-textMuted">No messages found.</p>
            </div>

            <MessageList
                v-else
                :conversation-id="conversation.id"
                class="flex-1"
                @reply="onReply"
                @edit="onEdit"
            />

            <div v-if="isBlocked" class="cv-chat-window__blocked-bar flex items-center justify-between gap-2 border-t border-converse-border bg-converse-surface px-4 py-3">
                <span class="text-sm text-converse-textMuted">You blocked this contact. New messages won't be sent.</span>
                <button type="button" class="shrink-0 text-sm font-medium text-converse-accent" @click="onUnblock">Unblock</button>
            </div>

            <MessageComposer
                v-else
                :conversation-id="conversation.id"
                :reply-to="replyTo"
                :editing="editing"
                @dismiss-reply="replyTo = null"
                @dismiss-edit="editing = null"
            />
        </div>

        <GroupInfoPanel
            v-if="showInfo"
            :conversation="conversation"
            @close="showInfo = false"
            @search="onToggleChatSearch(); showInfo = false"
        />
    </div>
</template>
