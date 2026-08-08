import { reactive } from 'vue';
import { chatableKey } from '../chatable';

const state = reactive({
    currentType: null,
    currentId: null,
    currentKey: null,
    conversations: [],
    activeConversationId: null,
    messagesByConversation: {},
    presenceByUser: {},
    typingByConversation: {},
    usersById: {},
    pinnedByConversation: {},
});

export function useChatStore() {
    return state;
}

export function setCurrentChatable(type, id) {
    state.currentType = type;
    state.currentId = id;
    state.currentKey = chatableKey(type, id);
}

export function upsertConversation(conversation) {
    const index = state.conversations.findIndex((c) => c.id === conversation.id);

    if (index === -1) {
        state.conversations.unshift(conversation);
    } else {
        state.conversations[index] = conversation;
    }
}

export function removeConversation(conversationId) {
    state.conversations = state.conversations.filter((c) => c.id !== conversationId);
}

export function setMessages(conversationId, messages) {
    state.messagesByConversation[conversationId] = messages;
}

export function prependMessages(conversationId, olderMessages) {
    const existing = state.messagesByConversation[conversationId] ?? [];
    state.messagesByConversation[conversationId] = [...olderMessages, ...existing];
}

export function upsertMessage(conversationId, message) {
    const list = state.messagesByConversation[conversationId] ?? (state.messagesByConversation[conversationId] = []);
    const index = list.findIndex((m) => m.id === message.id);

    if (index === -1) {
        list.push(message);
    } else {
        list[index] = message;
    }
}

export function removeMessage(conversationId, messageId) {
    const list = state.messagesByConversation[conversationId];
    if (!list) return;
    state.messagesByConversation[conversationId] = list.filter((m) => m.id !== messageId);
}

export function setTyping(conversationId, key, isTyping) {
    const set = state.typingByConversation[conversationId] ?? (state.typingByConversation[conversationId] = new Set());

    if (isTyping) {
        set.add(key);
    } else {
        set.delete(key);
    }
}

export function setPresence(key, presence) {
    state.presenceByUser[key] = { ...state.presenceByUser[key], ...presence };
}

export function cacheUsers(users) {
    for (const user of users) {
        state.usersById[chatableKey(user.type, user.id)] = user;
    }
}

export function setPinnedMessages(conversationId, messages) {
    state.pinnedByConversation[conversationId] = messages;
}

export function addPinnedMessage(conversationId, message) {
    const list = state.pinnedByConversation[conversationId] ?? (state.pinnedByConversation[conversationId] = []);
    if (!list.some((m) => m.id === message.id)) {
        list.push(message);
    }
}

export function removePinnedMessage(conversationId, messageId) {
    const list = state.pinnedByConversation[conversationId];
    if (!list) return;
    state.pinnedByConversation[conversationId] = list.filter((m) => m.id !== messageId);
}
