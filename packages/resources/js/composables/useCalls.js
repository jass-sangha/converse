import { useApi } from './useApi';

export function useCalls() {
    const api = useApi();

    async function signal(conversationId, payload, to = null) {
        await api.post(`/conversations/${conversationId}/call/signal`, {
            payload,
            ...(to ? { to_type: to.type, to_id: to.id } : {}),
        });
    }

    return { signal };
}
