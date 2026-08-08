import { useApi } from './useApi';
import { useChatStore, cacheUsers } from '../store';

export function useProfile() {
    const api = useApi();
    const store = useChatStore();

    async function ensureSelfCached() {
        if (!store.currentUserId || store.usersById[store.currentUserId]) {
            return store.usersById[store.currentUserId] ?? null;
        }

        const { data } = await api.get('/users', { params: { ids: [store.currentUserId] } });
        cacheUsers(data.data);
        return store.usersById[store.currentUserId] ?? null;
    }

    async function updateAvatar(file) {
        const form = new FormData();
        form.append('avatar', file);

        const { data } = await api.post('/profile/avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        cacheUsers([data.data]);
        return data.data;
    }

    return { ensureSelfCached, updateAvatar };
}
