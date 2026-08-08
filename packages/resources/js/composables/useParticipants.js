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
        return data.data;
    }

    async function remove(conversationId, type, id) {
        await api.delete(`/conversations/${conversationId}/participants/${type}/${id}`);
    }

    async function changeRole(conversationId, type, id, role) {
        await api.patch(`/conversations/${conversationId}/participants/${type}/${id}/role`, { role });
    }

    return { list, add, remove, changeRole };
}
