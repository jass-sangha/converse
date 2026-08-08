import { useApi } from './useApi';

export function usePrivacySettings() {
    const api = useApi();

    async function get() {
        const { data } = await api.get('/profile/settings');
        return data.data;
    }

    async function update(payload) {
        const { data } = await api.patch('/profile/settings', payload);
        return data.data;
    }

    return { get, update };
}
