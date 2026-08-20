import { useApi } from './useApi';

const timers = {};

export function useTyping() {
    const api = useApi();

    function notifyTyping(conversationId) {
        api.post(`/conversations/${conversationId}/typing`, { state: 'start' });

        clearTimeout(timers[conversationId]);
        timers[conversationId] = setTimeout(() => {
            api.post(`/conversations/${conversationId}/typing`, { state: 'stop' });
        }, 4000);
    }

    function stopTyping(conversationId) {
        clearTimeout(timers[conversationId]);
        api.post(`/conversations/${conversationId}/typing`, { state: 'stop' });
    }

    return { notifyTyping, stopTyping };
}
