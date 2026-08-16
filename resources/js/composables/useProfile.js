import { useApi } from './useApi';
import { useChatStore, cacheUsers } from '../store';

export function useProfile() {
    const api = useApi();
    const store = useChatStore();

    async function ensureSelfCached() {
        if (!store.currentKey || store.usersById[store.currentKey]) {
            return store.usersById[store.currentKey] ?? null;
        }

        const { data } = await api.get('/users', { params: { type: store.currentType, ids: [store.currentId] } });
        cacheUsers(data.data);
        return store.usersById[store.currentKey] ?? null;
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

    async function removeAvatar() {
        const { data } = await api.delete('/profile/avatar');
        cacheUsers([data.data]);
        return data.data;
    }

    return { ensureSelfCached, updateAvatar, removeAvatar };
}
