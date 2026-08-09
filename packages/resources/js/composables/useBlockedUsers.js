import { useApi } from './useApi';
import { useChatStore } from '../store';
import { chatableKey } from '../chatable';

export function useBlockedUsers() {
    const api = useApi();
    const store = useChatStore();

    async function list() {
        const { data } = await api.get('/blocked-users');
        return data.data;
    }

    async function loadBlocked() {
        const rows = await list();
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
