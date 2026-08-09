import { useApi } from './useApi';

export function useNotifications() {
    const api = useApi();

    async function muteAll(scope, mutedUntil) {
        await api.patch('/notifications/mute', { scope, muted_until: mutedUntil });
    }

    return { muteAll };
}
