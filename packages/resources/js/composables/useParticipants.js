import { useApi } from './useApi';

export function useParticipants() {
    const api = useApi();

    async function list(conversationId) {
        const { data } = await api.get(`/conversations/${conversationId}/participants`);
        return data.data;
    }

    /**
     * @param {Array<{type: string, id: number}>} participants
     */
    async function add(conversationId, participants) {
        const { data } = await api.post(`/conversations/${conversationId}/participants`, {
            participants: participants.map((p) => ({ type: p.type, id: p.id })),
        });
        return { participants: data.data, message: data.message };
    }

    async function remove(conversationId, type, id) {
        const { data } = await api.delete(`/conversations/${conversationId}/participants/${type}/${id}`);
        return { message: data.message };
    }

    async function changeRole(conversationId, type, id, role) {
        const { data } = await api.patch(`/conversations/${conversationId}/participants/${type}/${id}/role`, { role });
        return { message: data.message };
    }

    return { list, add, remove, changeRole };
}
