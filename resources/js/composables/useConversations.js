import { ref } from 'vue';
import { useApi } from './useApi';
import { useChatStore, upsertConversation, removeConversation } from '../store';

// Module-scoped (shared across every useConversations() call, like useMessages.js's `cursors`)
// rather than local state inside the composable — the sidebar and any other consumer need to
// see the same "is there another page" answer.
let currentFilters = {};
const hasMorePages = ref(false);
let nextPage = 2;

export function useConversations() {
    const api = useApi();
    const store = useChatStore();

    async function refresh(filters = {}) {
        const { data } = await api.get('/conversations', { params: filters });
        // A filtered fetch (e.g. Archived) can legitimately exclude the conversation currently
        // open on the right — keep it in the store regardless, so the chat window can still find
        // it and stays open while browsing a different sidebar view.
        const active = store.conversations.find((c) => c.id === store.activeConversationId);
        store.conversations = data.data;
        if (active && !store.conversations.some((c) => c.id === active.id)) {
            store.conversations.push(active);
        }
        currentFilters = filters;
        hasMorePages.value = !!data.links?.next;
        nextPage = 2;
        return store.conversations;
    }

    // The list endpoint is paginated (chat.pagination.conversations_per_page) rather than
    // returning every conversation the user has — this fetches the next page and appends,
    // rather than the initial full-list fetch refresh() does.
    async function loadMore() {
        if (!hasMorePages.value) return [];

        const { data } = await api.get('/conversations', { params: { ...currentFilters, page: nextPage } });

        for (const conversation of data.data) {
            if (!store.conversations.some((c) => c.id === conversation.id)) {
                store.conversations.push(conversation);
            }
        }

        hasMorePages.value = !!data.links?.next;
        nextPage += 1;
        return data.data;
    }

    async function refreshOne(conversationId) {
        const { data } = await api.get(`/conversations/${conversationId}`);
        upsertConversation(data.data);
        return data.data;
    }

    async function createPrivate(participant) {
        const { data } = await api.post('/conversations', {
            type: 'private',
            participants: [{ type: participant.type, id: participant.id }],
        });
        upsertConversation(data.data);
        return data.data;
    }

    async function createGroup(name, description, participants) {
        const { data } = await api.post('/conversations', {
            type: 'group',
            name,
            description,
            participants: participants.map((p) => ({ type: p.type, id: p.id })),
        });
        upsertConversation(data.data);
        return data.data;
    }

    async function mute(conversationId, mutedUntil) {
        const { data } = await api.patch(`/conversations/${conversationId}/mute`, { muted_until: mutedUntil });
        upsertConversation(data.data);
    }

    async function setArchived(conversationId, archived) {
        const { data } = await api.patch(`/conversations/${conversationId}/archive`, { archived });
        upsertConversation(data.data);
    }

    async function setPinned(conversationId, pinned) {
        const { data } = await api.patch(`/conversations/${conversationId}/pin`, { pinned });
        upsertConversation(data.data);
    }

    async function setUnread(conversationId, unread) {
        const { data } = await api.patch(`/conversations/${conversationId}/unread`, { unread });
        upsertConversation(data.data);
    }

    async function setFavourited(conversationId, favourited) {
        const { data } = await api.patch(`/conversations/${conversationId}/favourite`, { favourited });
        upsertConversation(data.data);
    }

    async function setHidden(conversationId, hidden) {
        const { data } = await api.patch(`/conversations/${conversationId}/hide`, { hidden });

        if (hidden) {
            removeConversation(conversationId);
        } else {
            upsertConversation(data.data);
        }
    }

    async function updateAvatar(conversationId, file) {
        const form = new FormData();
        form.append('avatar', file);
        const { data } = await api.post(`/conversations/${conversationId}/avatar`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        upsertConversation(data.data);
        return data.data;
    }

    async function removeAvatar(conversationId) {
        const { data } = await api.delete(`/conversations/${conversationId}/avatar`);
        upsertConversation(data.data);
        return data.data;
    }

    async function setWallpaper(conversationId, wallpaper) {
        const { data } = await api.patch(`/conversations/${conversationId}/wallpaper`, { wallpaper });
        upsertConversation(data.data);
    }

    async function leave(conversationId) {
        await api.post(`/conversations/${conversationId}/leave`);
        removeConversation(conversationId);
    }

    async function setDisappearing(conversationId, ttlSeconds) {
        const { data } = await api.patch(`/conversations/${conversationId}/disappearing`, { ttl_seconds: ttlSeconds });
        upsertConversation(data.data);
    }

    function setActive(conversationId) {
        store.activeConversationId = conversationId;
    }

    return {
        refresh,
        loadMore,
        hasMorePages,
        refreshOne,
        createPrivate,
        createGroup,
        mute,
        setArchived,
        setPinned,
        setUnread,
        setFavourited,
        setHidden,
        updateAvatar,
        removeAvatar,
        setWallpaper,
        leave,
        setDisappearing,
        setActive,
    };
}
