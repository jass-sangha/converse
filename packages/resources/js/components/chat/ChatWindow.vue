<script setup>
import { computed, ref, watch, onUnmounted } from 'vue';
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

const props = defineProps({
    messageSearchQuery: { type: String, default: '' },
});

const store = useChatStore();
const { setActive } = useConversations();
const { load, update, markDelivered, markRead, search } = useMessages();
const { list: listPinned, unpin, pinnedFor } = useMessagePins();

const replyTo = ref(null);
const editing = ref(null);
const showInfo = ref(false);
const searchResults = ref([]);

const conversation = computed(() => store.conversations.find((c) => c.id === store.activeConversationId));

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
    }
}, { immediate: true });

const pinnedMessages = computed(() => (conversation.value ? pinnedFor(conversation.value.id) : []));

function scrollToMessage(messageId) {
    document.getElementById(`cv-message-${messageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function onUnpinFromBanner(message) {
    await unpin(message);
}

watch(() => props.messageSearchQuery, async (q) => {
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
}

async function saveEdit(newBody) {
    if (editing.value) {
        await update(editing.value.id, editing.value.conversation_id, newBody);
        editing.value = null;
    }
}
</script>

<template>
    <div v-if="!conversation" class="cv-chat-window-empty flex h-full items-center justify-center bg-converse-bg text-converse-textMuted">
        <p>Select a conversation to start chatting.</p>
    </div>

    <div v-else class="cv-chat-window flex h-full">
        <div class="cv-chat-window__main flex h-full flex-1 flex-col">
            <ChatHeader :conversation="conversation" @back="onBack" @open-info="showInfo = !showInfo" />

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

            <div v-if="messageSearchQuery" class="cv-chat-window__search-results flex-1 overflow-y-auto p-3">
                <p class="mb-2 text-xs text-converse-textMuted">Results for "{{ messageSearchQuery }}"</p>
                <MessageBubble v-for="message in searchResults" :key="message.id" :message="message" />
                <p v-if="!searchResults.length" class="text-sm text-converse-textMuted">No messages found.</p>
            </div>

            <MessageList
                v-else
                :conversation-id="conversation.id"
                class="flex-1"
                @reply="onReply"
                @edit="onEdit"
            />

            <div v-if="editing" class="cv-chat-window__edit-bar border-t border-converse-border bg-converse-warning p-2">
                <p class="mb-1 text-xs text-converse-textMuted">Editing message</p>
                <div class="cv-chat-window__edit-actions flex gap-2">
                    <input
                        :value="editing.body"
                        type="text"
                        class="flex-1 rounded border border-converse-border px-2 py-1 text-sm"
                        @keyup.enter="(e) => saveEdit(e.target.value)"
                        @input="(e) => (editing.body = e.target.value)"
                    >
                    <button type="button" class="text-sm text-converse-accent" @click="saveEdit(editing.body)">Save</button>
                    <button type="button" class="text-sm text-converse-textMuted" @click="editing = null">Cancel</button>
                </div>
            </div>

            <MessageComposer
                v-else
                :conversation-id="conversation.id"
                :reply-to="replyTo"
                @dismiss-reply="replyTo = null"
            />
        </div>

        <GroupInfoPanel v-if="showInfo" :conversation="conversation" @close="showInfo = false" />
    </div>
</template>
