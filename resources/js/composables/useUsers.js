import { useApi } from './useApi';
import { useChatStore, cacheUsers } from '../store';
import { chatableKey } from '../chatable';

export function useUsers() {
    const api = useApi();
    const store = useChatStore();

    async function search(q, type = null, page = 1) {
        const params = { ...(q ? { q } : {}), ...(type ? { type } : {}), page };
        const { data } = await api.get('/users', { params });
        cacheUsers(data.data);
        return data;
    }

    /**
     * @param {Array<{type: string, id: number}>} refs
     */
    async function resolve(refs) {
        const missing = refs.filter((ref) => !store.usersById[chatableKey(ref.type, ref.id)]);

        if (missing.length > 0) {
            const byType = missing.reduce((acc, ref) => {
                (acc[ref.type] ??= []).push(ref.id);
                return acc;
            }, {});

            await Promise.all(Object.entries(byType).map(async ([type, ids]) => {
                const { data } = await api.get('/users', { params: { type, ids } });
                cacheUsers(data.data);
            }));
        }

        return refs.map((ref) => get(ref));
    }

    /**
     * @param {{type: string, id: number}|string} ref A {type, id} ref, or an
     *   already-built "type:id" key (see chatableKey()).
     */
    function get(ref) {
        if (!ref) {
            return { type: null, id: null, name: 'Unknown', avatar_url: null };
        }

        const key = typeof ref === 'string' ? ref : chatableKey(ref.type, ref.id);

        return store.usersById[key] ?? { type: ref.type ?? null, id: ref.id ?? null, name: 'Unknown', avatar_url: null };
    }

    return { search, resolve, get };
}
