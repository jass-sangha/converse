import { useEcho } from './useEcho';

const timers = {};

export function useTyping() {
    function notifyTyping(conversationId) {
        useEcho().whisperTyping(conversationId, 'start');

        clearTimeout(timers[conversationId]);
        timers[conversationId] = setTimeout(() => {
            useEcho().whisperTyping(conversationId, 'stop');
        }, 4000);
    }

    function stopTyping(conversationId) {
        clearTimeout(timers[conversationId]);
        useEcho().whisperTyping(conversationId, 'stop');
    }

    return { notifyTyping, stopTyping };
}
