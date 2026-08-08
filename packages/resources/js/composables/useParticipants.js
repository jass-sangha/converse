import { useApi } from './useApi';

export function useParticipants() {
    const api = useApi();

    async function list(conversationId) {
        const { data } = await api.get(`/conversations/${conversationId}/participants`);
        return data.data;
    }

    async function add(conversationId, userIds) {
        const { data } = await api.post(`/conversations/${conversationId}/participants`, { user_ids: userIds });
        return data.data;
    }

    async function remove(conversationId, userId) {
        await api.delete(`/conversations/${conversationId}/participants/${userId}`);
    }

    async function changeRole(conversationId, userId, role) {
        await api.patch(`/conversations/${conversationId}/participants/${userId}/role`, { role });
    }

    return { list, add, remove, changeRole };
}
