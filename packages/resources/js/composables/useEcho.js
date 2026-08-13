import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import {
    useChatStore,
    upsertMessage,
    removeMessage,
    setTyping,
    setPresence,
    upsertConversation,
    addPinnedMessage,
    removePinnedMessage,
} from '../store';
import { chatableKey } from '../chatable';
import { useConversations } from './useConversations';
import { useCall } from './useCall';

window.Pusher = Pusher;

let echo = null;
const joinedChannels = new Map();

// Echo/Pusher throws synchronously when broadcasting isn't configured (e.g. no Reverb key).
// A `noop` channel keeps every call site's chained `.listen()`/`.whisper()` API working so a
// missing realtime setup only disables live updates instead of breaking sending, typing, etc.
function noopChannel() {
    const channel = { listen: () => channel, whisper: () => channel };
    return channel;
}

const noopEcho = {
    private: () => noopChannel(),
    join: () => noopChannel(),
    leave: () => {},
};

export function useEcho() {
    if (echo) {
        return build();
    }

    const config = window.ConverseConfig ?? {};
    const broadcasting = config.broadcasting ?? {};
    const driver = broadcasting.driver ?? 'reverb';

    try {
        if (driver === 'reverb') {
            echo = new Echo({
                broadcaster: 'reverb',
                key: broadcasting.key,
                wsHost: broadcasting.host || window.location.hostname,
                wsPort: broadcasting.port ?? (broadcasting.scheme === 'https' ? 443 : 8080),
                wssPort: broadcasting.port ?? 443,
                forceTLS: broadcasting.scheme === 'https',
                enabledTransports: ['ws', 'wss'],
                authEndpoint: (config.apiBaseUrl || '/api/chat') + '/broadcasting/auth',
            });
        } else if (driver === 'pusher') {
            echo = new Echo({
                broadcaster: 'pusher',
                key: broadcasting.key,
                cluster: broadcasting.cluster,
                forceTLS: true,
                authEndpoint: (config.apiBaseUrl || '/api/chat') + '/broadcasting/auth',
            });
        } else {
            echo = noopEcho;
        }

        if (echo !== noopEcho && config.chatableType && config.chatableId) {
            echo.private(`chatable.${config.chatableType}.${config.chatableId}`)
                .listen('.conversation.created', () => {
                    useConversations().refresh();
                })
                .listen('.participant.added', (payload) => {
                    const iWasAdded = payload.chatables?.some(
                        (c) => c.type === config.chatableType && c.id === config.chatableId
                    );

                    if (iWasAdded) {
                        useConversations().refresh();
                    }
                })
                // Personal channel, not the per-conversation one — joined at boot regardless
                // of which conversation (if any) is open, so an incoming call always arrives.
                .listen('.call.signal', (payload) => {
                    useCall().handleSignal(payload);
                });
        }
    } catch (error) {
        console.warn('[converse] Realtime broadcasting is unavailable; live updates are disabled.', error);
        echo = noopEcho;
    }

    return build();
}

function build() {
    return {
        joinConversation,
        leaveConversation,
        whisperTyping,
    };
}

function joinConversation(conversationId) {
    if (joinedChannels.has(conversationId)) {
        return joinedChannels.get(conversationId);
    }

    const store = useChatStore();

    const channel = echo.join(`conversation.${conversationId}`)
        .listen('.message.sent', (payload) => {
            upsertMessage(conversationId, payload);
            const conversation = store.conversations.find((c) => c.id === conversationId);
            if (conversation) {
                upsertConversation({ ...conversation, last_message: payload, last_activity_at: payload.created_at });
            }
        })
        .listen('.message.updated', (payload) => {
            upsertMessage(conversationId, { ...findMessage(conversationId, payload.id), ...payload });
        })
        .listen('.message.deleted', (payload) => {
            const existing = findMessage(conversationId, payload.id);
            if (existing) {
                upsertMessage(conversationId, { ...existing, deleted_for_everyone: true, body: null });
            }
        })
        .listen('.message.reacted', (payload) => {
            const existing = findMessage(conversationId, payload.message_id);
            if (existing) {
                upsertMessage(conversationId, { ...existing, reactions: payload.reactions });
            }
        })
        .listen('.message.poll-voted', (payload) => {
            const existing = findMessage(conversationId, payload.message_id);
            if (existing) {
                upsertMessage(conversationId, { ...existing, poll: payload.poll });
            }
        })
        .listen('.message.event-rsvped', (payload) => {
            const existing = findMessage(conversationId, payload.message_id);
            if (existing) {
                upsertMessage(conversationId, { ...existing, event: payload.event });
            }
        })
        .listen('.messages.delivered', () => {
            markStatusAtLeast(conversationId, 'delivered');
        })
        .listen('.messages.read', () => {
            markStatusAtLeast(conversationId, 'read');
        })
        .listen('.typing.start', (payload) => {
            const key = chatableKey(payload.chatable_type, payload.chatable_id);
            if (key !== store.currentKey) {
                setTyping(conversationId, key, true);
            }
        })
        .listen('.typing.stop', (payload) => {
            setTyping(conversationId, chatableKey(payload.chatable_type, payload.chatable_id), false);
        })
        .listen('.presence.changed', (payload) => {
            setPresence(chatableKey(payload.chatable_type, payload.chatable_id), {
                is_online: payload.is_online,
                last_seen_at: payload.last_seen_at,
            });
        })
        .listen('.participant.role_changed', () => {
            useConversations().refreshOne(conversationId);
        })
        .listen('.participant.removed', () => {
            useConversations().refreshOne(conversationId);
        })
        .listen('.message.pinned', (payload) => {
            const message = findMessage(conversationId, payload.id);
            if (message) {
                addPinnedMessage(conversationId, message);
            }
        })
        .listen('.message.unpinned', (payload) => {
            removePinnedMessage(conversationId, payload.id);
        });

    joinedChannels.set(conversationId, channel);

    return channel;
}

function leaveConversation(conversationId) {
    echo?.leave(`conversation.${conversationId}`);
    joinedChannels.delete(conversationId);
}

function whisperTyping(conversationId, state) {
    joinedChannels.get(conversationId)?.whisper('typing', { state });
}

function findMessage(conversationId, messageId) {
    const store = useChatStore();
    return (store.messagesByConversation[conversationId] ?? []).find((m) => m.id === messageId);
}

function markStatusAtLeast(conversationId, status) {
    const store = useChatStore();
    const list = store.messagesByConversation[conversationId] ?? [];
    for (const message of list) {
        if (status === 'read' || (status === 'delivered' && message.status === 'sent')) {
            message.status = status;
        }
    }
}
