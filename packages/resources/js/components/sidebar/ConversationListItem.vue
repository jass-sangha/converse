<script setup>
import { computed, onMounted, watch } from 'vue';
import Avatar from '../shared/Avatar.vue';
import PresenceDot from '../shared/PresenceDot.vue';
import ConversationMenu from './ConversationMenu.vue';
import { useUsers } from '../../composables/useUsers';
import { useConversations } from '../../composables/useConversations';
import { useChatStore } from '../../store';

const props = defineProps({
    conversation: { type: Object, required: true },
    active: { type: Boolean, default: false },
});

defineEmits(['select']);

const store = useChatStore();
const { resolve } = useUsers();
const { mute, setPinned, setHidden, leave } = useConversations();

const isPinned = computed(() => !!(props.conversation.pinned_at || props.conversation.me?.pinned_at));
const isMuted = computed(() => !!props.conversation.me?.muted_until);
const isGroup = computed(() => props.conversation.type === 'group');

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

const otherParticipantId = computed(() => {
    if (props.conversation.type !== 'private') return null;
    const other = (props.conversation.participants ?? []).find((p) => p.user_id !== store.currentUserId);
    return other?.user_id ?? null;
});

async function ensureResolved() {
    if (otherParticipantId.value) {
        await resolve([otherParticipantId.value]);
    }
}

onMounted(ensureResolved);
watch(otherParticipantId, ensureResolved);

const displayName = computed(() => {
    if (props.conversation.type === 'group') {
        return props.conversation.name || 'Group';
    }

    if (otherParticipantId.value) {
        return store.usersById[otherParticipantId.value]?.name ?? `User #${otherParticipantId.value}`;
    }

    return 'Unknown';
});

const avatarUrl = computed(() => {
    if (props.conversation.avatar_url) return props.conversation.avatar_url;
    if (otherParticipantId.value) return store.usersById[otherParticipantId.value]?.avatar_url ?? null;
    return null;
});

const lastMessagePreview = computed(() => {
    const message = props.conversation.last_message;
    if (!message) return '';
    if (message.deleted_for_everyone) return 'This message was deleted';
    if (message.type !== 'text') return `[${message.type}]`;
    return message.body ?? '';
});
</script>

<template>
    <li
        class="cv-conversation-item flex cursor-pointer items-center gap-3 border-b border-converse-border px-3 py-2 hover:bg-converse-surfaceHover"
        :class="{ 'bg-converse-bubbleOut': active }"
        @click="$emit('select', conversation.id)"
    >
        <Avatar :name="displayName" :avatar-url="avatarUrl" :size="44" />

        <div class="cv-conversation-item__body min-w-0 flex-1">
            <div class="cv-conversation-item__title-row flex items-center justify-between gap-2">
                <span class="truncate font-medium text-converse-text">{{ displayName }}</span>
                <span class="cv-conversation-item__badges flex items-center gap-1">
                    <span v-if="isMuted" title="Muted">🔇</span>
                    <span v-if="isPinned" title="Pinned">📌</span>
                </span>
            </div>
            <div class="cv-conversation-item__preview-row flex items-center justify-between gap-2">
                <span class="truncate text-sm text-converse-textMuted">{{ lastMessagePreview }}</span>
                <span
                    v-if="conversation.unread_count > 0"
                    class="cv-conversation-item__unread flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-converse-accent px-1 text-xs text-converse-accentContrast"
                >
                    {{ conversation.unread_count }}
                </span>
            </div>
            <PresenceDot v-if="otherParticipantId" :user-id="otherParticipantId" />
        </div>

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
    </li>
</template>
