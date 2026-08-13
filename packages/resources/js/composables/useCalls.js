import { useApi } from './useApi';

export function useCalls() {
    const api = useApi();

    async function signal(conversationId, payload) {
        await api.post(`/conversations/${conversationId}/call/signal`, { payload });
    }

    return { signal };
}
