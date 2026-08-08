import { useApi } from './useApi';

export function useBlockedUsers() {
    const api = useApi();

    async function list() {
        const { data } = await api.get('/blocked-users');
        return data.data;
    }

    async function block(chatable) {
        await api.post('/blocked-users', { chatable_type: chatable.type, chatable_id: chatable.id });
    }

    async function unblock(type, id) {
        await api.delete(`/blocked-users/${type}/${id}`);
    }

    return { list, block, unblock };
}
