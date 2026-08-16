import { useApi } from './useApi';
import { useChatStore, setPinnedMessages, addPinnedMessage, removePinnedMessage } from '../store';

export function useMessagePins() {
    const api = useApi();
    const store = useChatStore();

    async function list(conversationId) {
        const { data } = await api.get(`/conversations/${conversationId}/pinned-messages`);
        setPinnedMessages(conversationId, data.data);
        return data.data;
    }

    async function pin(message) {
        await api.post(`/messages/${message.id}/pin`);
        addPinnedMessage(message.conversation_id, message);
    }

    async function unpin(message) {
        await api.delete(`/messages/${message.id}/pin`);
        removePinnedMessage(message.conversation_id, message.id);
    }

    function pinnedFor(conversationId) {
        return store.pinnedByConversation[conversationId] ?? [];
    }

    return { list, pin, unpin, pinnedFor };
}
