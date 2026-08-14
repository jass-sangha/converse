import { useApi } from './useApi';
import { useChatStore, upsertConversation, removeConversation } from '../store';

export function useConversations() {
    const api = useApi();
    const store = useChatStore();

    async function refresh(filters = {}) {
        const { data } = await api.get('/conversations', { params: filters });
        store.conversations = data.data;
        return store.conversations;
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
        refreshOne,
        createPrivate,
        createGroup,
        mute,
        setArchived,
        setPinned,
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
