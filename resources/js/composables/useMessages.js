import { useApi } from './useApi';
import { useChatStore, setMessages, prependMessages, upsertMessage, removeMessage, upsertConversation } from '../store';

const cursors = {};
let localIdCounter = -1;

export function useMessages() {
    const api = useApi();
    const store = useChatStore();

    async function load(conversationId) {
        const { data } = await api.get(`/conversations/${conversationId}/messages`);
        setMessages(conversationId, data.data.reverse());
        cursors[conversationId] = data.data.length ? data.data[0].id : null;
        return store.messagesByConversation[conversationId];
    }

    async function loadOlder(conversationId) {
        const beforeId = cursors[conversationId];
        if (!beforeId) return [];

        const { data } = await api.get(`/conversations/${conversationId}/messages`, {
            params: { before_id: beforeId },
        });

        if (data.data.length) {
            cursors[conversationId] = data.data[data.data.length - 1].id;
            prependMessages(conversationId, data.data.reverse());
        } else {
            cursors[conversationId] = null;
        }

        return data.data;
    }

    async function send(conversationId, payload) {
        const optimisticId = localIdCounter--;
        const optimistic = {
            id: optimisticId,
            conversation_id: conversationId,
            chatable_type: store.currentType,
            chatable_id: store.currentId,
            type: payload.type ?? 'text',
            body: payload.body ?? null,
            metadata: payload.metadata ?? null,
            reply_to: payload.replyTo ?? null,
            attachments: payload.attachments ?? [],
            reactions: [],
            status: 'sending',
            created_at: new Date().toISOString(),
            _pending: true,
        };

        upsertMessage(conversationId, optimistic);

        try {
            const { data } = await api.post(`/conversations/${conversationId}/messages`, {
                type: payload.type ?? 'text',
                body: payload.body ?? null,
                reply_to_message_id: payload.reply_to_message_id ?? null,
                metadata: payload.metadata ?? null,
                attachment_ids: payload.attachment_ids ?? undefined,
            });

            removeMessage(conversationId, optimisticId);
            upsertMessage(conversationId, data.data);

            return data.data;
        } catch (error) {
            removeMessage(conversationId, optimisticId);
            throw error;
        }
    }

    async function update(messageId, conversationId, body) {
        const { data } = await api.patch(`/messages/${messageId}`, { body });
        upsertMessage(conversationId, data.data);
        return data.data;
    }

    async function editHistory(messageId) {
        const { data } = await api.get(`/messages/${messageId}/edits`);
        return data.data;
    }

    async function deleteForEveryone(messageId, conversationId) {
        await api.delete(`/messages/${messageId}`);
        const existing = (store.messagesByConversation[conversationId] ?? []).find((m) => m.id === messageId);
        if (existing) {
            upsertMessage(conversationId, { ...existing, deleted_for_everyone: true, body: null });
        }
    }

    async function deleteForMe(messageId, conversationId) {
        await api.delete(`/messages/${messageId}/me`);
        removeMessage(conversationId, messageId);
    }

    async function forward(messageId, conversationIds) {
        const { data } = await api.post(`/messages/${messageId}/forward`, { conversation_ids: conversationIds });

        // Nothing else inserts these locally — each forwarded copy lands in a conversation this
        // client didn't just "have open and type into" the way send() does, so without this the
        // sender's own sidebar preview/ordering for the target conversation(s) only picks it up
        // on the next reload, and the message itself wouldn't be there if you switch to one of
        // those conversations without reloading either.
        for (const message of data.data) {
            upsertMessage(message.conversation_id, message);
            const conversation = store.conversations.find((c) => c.id === message.conversation_id);
            if (conversation) {
                upsertConversation({ ...conversation, last_message: message, last_activity_at: message.created_at });
            }
        }

        return data.data;
    }

    async function react(messageId, conversationId, emoji) {
        const { data } = await api.post(`/messages/${messageId}/reactions`, { emoji });
        applyReactions(conversationId, messageId, data.data);
    }

    async function unreact(messageId, conversationId) {
        const { data } = await api.delete(`/messages/${messageId}/reactions`);
        applyReactions(conversationId, messageId, data.data);
    }

    function applyReactions(conversationId, messageId, reactions) {
        const existing = (store.messagesByConversation[conversationId] ?? []).find((m) => m.id === messageId);
        if (existing) {
            upsertMessage(conversationId, { ...existing, reactions });
        }
    }

    async function votePoll(messageId, conversationId, optionIndex) {
        const { data } = await api.post(`/messages/${messageId}/poll/vote`, { option_index: optionIndex });
        const existing = (store.messagesByConversation[conversationId] ?? []).find((m) => m.id === messageId);
        if (existing) {
            upsertMessage(conversationId, { ...existing, poll: data.data });
        }
        return data.data;
    }

    async function respondToEvent(messageId, conversationId, status) {
        const { data } = await api.post(`/messages/${messageId}/event/rsvp`, { status });
        const existing = (store.messagesByConversation[conversationId] ?? []).find((m) => m.id === messageId);
        if (existing) {
            upsertMessage(conversationId, { ...existing, event: data.data });
        }
        return data.data;
    }

    async function star(messageId) {
        await api.post(`/messages/${messageId}/star`);
    }

    async function unstar(messageId) {
        await api.delete(`/messages/${messageId}/star`);
    }

    async function uploadAttachment(file) {
        const form = new FormData();
        form.append('file', file);
        const { data } = await api.post('/attachments', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data;
    }

    async function markDelivered(conversationId) {
        await api.post(`/conversations/${conversationId}/receipts/delivered`);
    }

    async function markRead(conversationId, upToMessageId) {
        await api.post(`/conversations/${conversationId}/receipts/read`, { up_to_message_id: upToMessageId });
    }

    async function search(q, conversationId = null) {
        const { data } = await api.get('/messages/search', { params: { q, conversation_id: conversationId } });
        return data.data;
    }

    async function media(kind, conversationId = null, page = 1, q = null) {
        const { data } = await api.get('/messages/media', {
            params: { kind, conversation_id: conversationId, page, q: q || undefined },
        });
        return data;
    }

    async function clear(conversationId) {
        await api.delete(`/conversations/${conversationId}/messages`);
        setMessages(conversationId, []);

        const conversation = store.conversations.find((c) => c.id === conversationId);
        if (conversation) {
            upsertConversation({ ...conversation, last_message: null });
        }
    }

    return {
        load,
        loadOlder,
        send,
        update,
        editHistory,
        deleteForEveryone,
        deleteForMe,
        forward,
        react,
        unreact,
        votePoll,
        respondToEvent,
        star,
        unstar,
        uploadAttachment,
        markDelivered,
        markRead,
        search,
        media,
        clear,
    };
}
