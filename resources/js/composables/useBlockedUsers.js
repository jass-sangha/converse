import { useApi } from './useApi';
import { useChatStore } from '../store';
import { chatableKey } from '../chatable';

export function useBlockedUsers() {
    const api = useApi();
    const store = useChatStore();

    async function list(page = 1) {
        const { data } = await api.get('/blocked-users', { params: { page } });
        return data;
    }

    // Builds the full blocked-keys set used by `isBlocked()` checks throughout the UI, so it has
    // to walk every page rather than just the first — unlike a listing a user scrolls through,
    // this is a membership set that must be complete to be correct.
    async function loadBlocked() {
        let page = 1;
        let rows = [];
        while (true) {
            const response = await list(page);
            rows = rows.concat(response.data);
            const lastPage = response.meta?.last_page ?? page;
            if (page >= lastPage) break;
            page += 1;
        }
        store.blockedKeys = rows.map((row) => chatableKey(row.blocked_type, row.blocked_id));
        return rows;
    }

    async function block(chatable) {
        await api.post('/blocked-users', { chatable_type: chatable.type, chatable_id: chatable.id });
        const key = chatableKey(chatable.type, chatable.id);
        if (!store.blockedKeys.includes(key)) {
            store.blockedKeys = [...store.blockedKeys, key];
        }
    }

    async function unblock(type, id) {
        await api.delete(`/blocked-users/${type}/${id}`);
        const key = chatableKey(type, id);
        store.blockedKeys = store.blockedKeys.filter((k) => k !== key);
    }

    function isBlocked(chatable) {
        return store.blockedKeys.includes(chatableKey(chatable.type, chatable.id));
    }

    return { list, loadBlocked, block, unblock, isBlocked };
}
