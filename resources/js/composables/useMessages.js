import { useApi } from './useApi';
import { useChatStore, setMessages, prependMessages, upsertMessage, replaceMessage, removeMessage, upsertConversation } from '../store';

const cursors = {};
let localIdCounter = -1;
const pollVoteRequests = {};

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

    // `payload.metadataPromise` (link previews are the only current use) is awaited *after* the
    // optimistic push below, not before — fetching a preview can take seconds, and the old
    // composer behavior of awaiting it before send() ran delayed the optimistic bubble itself,
    // letting a plain-text message sent right after appear first and out of order. Claiming this
    // message's list slot synchronously, before any await, keeps display order matching send
    // order regardless of preview fetch time.
    async function send(conversationId, payload) {
        const optimisticId = localIdCounter--;
        const optimistic = {
            id: optimisticId,
            conversation_id: conversationId,
            chatable_type: store.currentType,
            chatable_id: store.currentId,
            type: payload.type ?? 'text',
            body: payload.body ?? null,
            metadata: payload.metadataPromise ? null : (payload.metadata ?? null),
            reply_to: payload.replyTo ?? null,
            attachments: payload.attachments ?? [],
            reactions: [],
            status: 'sending',
            created_at: new Date().toISOString(),
            _pending: true,
        };

        upsertMessage(conversationId, optimistic);

        try {
            const metadata = payload.metadataPromise ? await payload.metadataPromise : (payload.metadata ?? null);

            const { data } = await api.post(`/conversations/${conversationId}/messages`, {
                type: payload.type ?? 'text',
                body: payload.body ?? null,
                reply_to_message_id: payload.reply_to_message_id ?? null,
                metadata,
                attachment_ids: payload.attachment_ids ?? undefined,
            });

            replaceMessage(conversationId, optimisticId, data.data);

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

        // Nothing else inserts these locally — unlike send(), a forwarded copy lands in a
        // conversation the client didn't just type into. Without this, the sender's sidebar
        // preview/order for the target conversation(s) only updates on reload, and the message
        // itself wouldn't show if you switched there without reloading.
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
        const requestId = (pollVoteRequests[messageId] ?? 0) + 1;
        pollVoteRequests[messageId] = requestId;

        const { data } = await api.post(`/messages/${messageId}/poll/vote`, { option_index: optionIndex });

        // Responses can resolve out of order (rapid option switching fires overlapping requests)
        // — only the most recently sent request's response is allowed to update the store, so a
        // stale response can't clobber a newer vote and make the selection jump back.
        if (pollVoteRequests[messageId] !== requestId) {
            return data.data;
        }

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
