import { useApi } from './useApi';

export function useBlockedUsers() {
    const api = useApi();

    async function list() {
        const { data } = await api.get('/blocked-users');
        return data.data;
    }

    async function block(userId) {
        await api.post('/blocked-users', { user_id: userId });
    }

    async function unblock(userId) {
        await api.delete(`/blocked-users/${userId}`);
    }

    return { list, block, unblock };
}
