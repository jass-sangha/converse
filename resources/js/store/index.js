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
    pendingScrollMessageId: null,
    blockedKeys: [],
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

// Swaps an optimistic message for its server-confirmed version in place, rather than
// removeMessage() + upsertMessage() (which drops it and re-pushes to the end of the list).
// Sending several messages in quick succession fires their requests back to back, and
// responses don't reliably resolve in that same order — remove-then-push-to-end would let a
// later message's response "win" the last slot before an earlier one's response arrives,
// visibly reordering the list. Replacing at the optimistic entry's existing index keeps
// display order matching send order regardless of which response lands first.
export function replaceMessage(conversationId, oldMessageId, message) {
    const list = state.messagesByConversation[conversationId];
    const index = list ? list.findIndex((m) => m.id === oldMessageId) : -1;

    if (index === -1) {
        upsertMessage(conversationId, message);
        return;
    }

    list[index] = message;
}

export function removeMessage(conversationId, messageId) {
    const list = state.messagesByConversation[conversationId];
    if (!list) return;
    state.messagesByConversation[conversationId] = list.filter((m) => m.id !== messageId);
}

export function setTyping(conversationId, key, isTyping) {
    if (!state.typingByConversation[conversationId]) {
        state.typingByConversation[conversationId] = new Set();
    }
    // Re-read after creating: the assignment above evaluates to the raw Set, not the reactive
    // proxy Vue wraps it in, and mutating the raw Set bypasses reactivity tracking entirely.
    const set = state.typingByConversation[conversationId];

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
