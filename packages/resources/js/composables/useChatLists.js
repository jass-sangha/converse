import { useApi } from './useApi';

export function useChatLists() {
    const api = useApi();

    async function index() {
        const { data } = await api.get('/lists');
        return data.data;
    }

    async function create(name, conversationIds = []) {
        const { data } = await api.post('/lists', { name, conversation_ids: conversationIds });
        return data.data;
    }

    async function destroy(listId) {
        await api.delete(`/lists/${listId}`);
    }

    async function addConversation(listId, conversationId) {
        await api.post(`/lists/${listId}/conversations`, { conversation_id: conversationId });
    }

    async function removeConversation(listId, conversationId) {
        await api.delete(`/lists/${listId}/conversations/${conversationId}`);
    }

    return { index, create, destroy, addConversation, removeConversation };
}
