<script setup>
import { computed, onMounted, watch } from 'vue';
import Avatar from '../shared/Avatar.vue';
import PresenceDot from '../shared/PresenceDot.vue';
import ConversationMenu from './ConversationMenu.vue';
import ReadReceiptTicks from '../chat/ReadReceiptTicks.vue';
import { useUsers } from '../../composables/useUsers';
import { useConversations } from '../../composables/useConversations';
import { useChatStore } from '../../store';
import { chatableKey, chatableKeyOf } from '../../chatable';

const props = defineProps({
    conversation: { type: Object, required: true },
    active: { type: Boolean, default: false },
});

defineEmits(['select']);

const store = useChatStore();
const { resolve, get } = useUsers();
const { mute, setPinned, setHidden, leave } = useConversations();

const isPinned = computed(() => !!(props.conversation.pinned_at || props.conversation.me?.pinned_at));
const isMuted = computed(() => !!props.conversation.me?.muted_until);
const isGroup = computed(() => props.conversation.type === 'group');
const isBlocked = computed(() => !!otherParticipant.value && store.blockedKeys.includes(chatableKey(otherParticipant.value.type, otherParticipant.value.id)));

function onMenuAction(action) {
    switch (action) {
        case 'mute':
            return mute(props.conversation.id, new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString());
        case 'unmute':
            return mute(props.conversation.id, null);
        case 'pin':
            return setPinned(props.conversation.id, true);
        case 'unpin':
            return setPinned(props.conversation.id, false);
        case 'delete':
            return setHidden(props.conversation.id, true);
        case 'leave':
            return leave(props.conversation.id);
        default:
            return null;
    }
}

const otherParticipant = computed(() => {
    if (props.conversation.type !== 'private') return null;
    const other = (props.conversation.participants ?? []).find((p) => chatableKeyOf(p) !== store.currentKey);
    return other ? { type: other.chatable_type, id: other.chatable_id } : null;
});

async function ensureResolved() {
    if (otherParticipant.value) {
        await resolve([otherParticipant.value]);
    }
}

onMounted(ensureResolved);
watch(otherParticipant, ensureResolved);

const displayName = computed(() => {
    if (props.conversation.type === 'group') {
        return props.conversation.name || 'Group';
    }

    return otherParticipant.value ? get(otherParticipant.value).name : 'Unknown';
});

const avatarUrl = computed(() => {
    if (props.conversation.avatar_url) return props.conversation.avatar_url;
    return otherParticipant.value ? get(otherParticipant.value).avatar_url : null;
});

const lastMessagePreview = computed(() => {
    const message = props.conversation.last_message;
    if (!message) return '';
    if (message.deleted_for_everyone) return 'This message was deleted';
    if (message.type !== 'text') return `[${message.type}]`;
    return message.body ?? '';
});

const isLastMessageOwn = computed(() => {
    const message = props.conversation.last_message;
    return !!message && chatableKeyOf(message) === store.currentKey;
});

const lastActivityLabel = computed(() => {
    const at = props.conversation.last_message?.created_at ?? props.conversation.last_activity_at;
    if (!at) return '';

    const date = new Date(at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    const daysAgo = Math.floor((now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000);
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
});
</script>

<template>
    <li
        class="cv-conversation-item group flex cursor-pointer items-center gap-2.5 px-3 py-1.5 hover:bg-converse-surfaceHover"
        :class="{ 'bg-converse-surfaceHover': active }"
        @click="$emit('select', conversation.id)"
    >
        <Avatar :name="displayName" :avatar-url="avatarUrl" :size="42" />

        <div class="cv-conversation-item__body min-w-0 flex-1 border-b border-converse-border pb-1.5">
            <div class="cv-conversation-item__title-row flex items-center justify-between gap-2">
                <span class="flex min-w-0 items-center gap-1">
                    <span class="truncate text-sm text-converse-text">{{ displayName }}</span>
                    <svg v-if="isBlocked" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" class="shrink-0 text-converse-danger" title="Blocked"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.94 7.94 0 0 1 4 12a8 8 0 0 1 8-8Zm0 16c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.94 7.94 0 0 1 20 12a8 8 0 0 1-8 8Z"/></svg>
                </span>
                <span v-if="lastActivityLabel" class="shrink-0 text-[11px] text-converse-textMuted">{{ lastActivityLabel }}</span>
            </div>
            <div class="cv-conversation-item__preview-row flex items-center justify-between gap-2">
                <span class="flex min-w-0 items-center truncate text-[13px] text-converse-textMuted">
                    <ReadReceiptTicks v-if="isLastMessageOwn && !conversation.last_message?.deleted_for_everyone" :status="conversation.last_message.status" />
                    <span class="truncate">{{ lastMessagePreview }}</span>
                </span>
                <span class="cv-conversation-item__badges flex shrink-0 items-center gap-1">
                    <span v-if="isMuted" class="text-converse-textMuted" title="Muted">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 8.03v1.66l2.45 2.45c.03-.14.05-.28.05-.14ZM19 12c0 .94-.2 1.82-.54 2.63l1.51 1.51A8.93 8.93 0 0 0 21 12h-2ZM4.27 3 3 4.27l6 6V12a3 3 0 0 0 4.7 2.46l1.32 1.32A4.48 4.48 0 0 1 12 16.5 4.5 4.5 0 0 1 7.5 12H5.5a6.5 6.5 0 0 0 6 6.48V21h2v-2.02a6.46 6.46 0 0 0 2.79-1.05L19.73 21 21 19.73 4.27 3Z"/></svg>
                    </span>
                    <span
                        v-if="conversation.unread_count > 0"
                        class="cv-conversation-item__unread flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-converse-accent px-1.5 text-xs font-medium text-converse-accentContrast"
                    >
                        {{ conversation.unread_count }}
                    </span>
                    <span v-else-if="isPinned" class="text-converse-textMuted" title="Pinned">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 3v6.5l2 3V15h-6v6l-1 1-1-1v-6H4v-2.5l2-3V3Z"/></svg>
                    </span>
                </span>
            </div>
            <PresenceDot v-if="otherParticipant" :chatable-key="chatableKey(otherParticipant.type, otherParticipant.id)" />
        </div>

        <div class="cv-conversation-item__menu-wrap opacity-0 group-hover:opacity-100 focus-within:opacity-100">
            <ConversationMenu
                :pinned="isPinned"
                :muted="isMuted"
                :is-group="isGroup"
                @mute="onMenuAction('mute')"
                @unmute="onMenuAction('unmute')"
                @pin="onMenuAction('pin')"
                @unpin="onMenuAction('unpin')"
                @delete="onMenuAction('delete')"
                @leave="onMenuAction('leave')"
            />
        </div>
    </li>
</template>
