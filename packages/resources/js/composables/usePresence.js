import { useApi } from './useApi';
import { setPresence } from '../store';
import { chatableKey } from '../chatable';

// Matches the backend's default `chat.presence.heartbeat_ttl_seconds` (60s) with a safety margin
// so a heartbeat always lands before the server-side online window would lapse.
const HEARTBEAT_INTERVAL_MS = 45_000;

let heartbeatTimer = null;

export function usePresence() {
    const api = useApi();

    function start() {
        if (heartbeatTimer) return;

        beat();
        heartbeatTimer = setInterval(beat, HEARTBEAT_INTERVAL_MS);
    }

    function stop() {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }

    async function beat() {
        await api.post('/presence/heartbeat');
    }

    async function fetchPresence(chatable) {
        const { data } = await api.get(`/users/${chatable.type}/${chatable.id}/presence`);
        setPresence(chatableKey(chatable.type, chatable.id), data.data);
        return data.data;
    }

    return { start, stop, fetchPresence };
}
