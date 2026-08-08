import { useApi } from './useApi';
import { useChatStore, cacheUsers } from '../store';

export function useUsers() {
    const api = useApi();
    const store = useChatStore();

    async function search(q) {
        const { data } = await api.get('/users', { params: q ? { q } : {} });
        cacheUsers(data.data);
        return data.data;
    }

    async function resolve(ids) {
        const missing = ids.filter((id) => !store.usersById[id]);

        if (missing.length > 0) {
            const { data } = await api.get('/users', { params: { ids: missing } });
            cacheUsers(data.data);
        }

        return ids.map((id) => store.usersById[id] ?? { id, name: `User #${id}`, avatar_url: null });
    }

    function get(id) {
        return store.usersById[id] ?? { id, name: `User #${id}`, avatar_url: null };
    }

    return { search, resolve, get };
}
