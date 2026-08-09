<script setup>
import { computed, onMounted, watch } from 'vue';
import Avatar from '../shared/Avatar.vue';
import { useChatStore } from '../../store';
import { chatableKey, chatableKeyOf } from '../../chatable';
import { useUsers } from '../../composables/useUsers';
import { usePresence } from '../../composables/usePresence';

const props = defineProps({
    conversation: { type: Object, required: true },
    searchOpen: { type: Boolean, default: false },
});

const emit = defineEmits(['back', 'open-info', 'toggle-search']);

const store = useChatStore();
const { resolve, get } = useUsers();
const { fetchPresence } = usePresence();

const otherParticipant = computed(() => {
    if (props.conversation.type !== 'private') return null;
    const other = (props.conversation.participants ?? []).find((p) => chatableKeyOf(p) !== store.currentKey);
    return other ? { type: other.chatable_type, id: other.chatable_id } : null;
});

async function ensureResolved() {
    if (otherParticipant.value) {
        await Promise.all([resolve([otherParticipant.value]), fetchPresence(otherParticipant.value)]);
    }
}

onMounted(ensureResolved);
watch(otherParticipant, ensureResolved);

const displayName = computed(() => {
    if (props.conversation.type === 'group') return props.conversation.name || 'Group';
    return otherParticipant.value ? get(otherParticipant.value).name : 'Unknown';
});

const avatarUrl = computed(() => {
    if (props.conversation.avatar_url) return props.conversation.avatar_url;
    return otherParticipant.value ? get(otherParticipant.value).avatar_url : null;
});

const typingUsers = computed(() => {
    const set = store.typingByConversation[props.conversation.id];
    if (!set || !set.size) return [];
    return Array.from(set).map((key) => get(key).name);
});

const subtitle = computed(() => {
    if (props.conversation.type === 'group') {
        const count = props.conversation.participants?.length ?? 0;
        return count ? `${count} participants` : '';
    }

    if (!otherParticipant.value) return '';
    const presence = store.presenceByUser[chatableKey(otherParticipant.value.type, otherParticipant.value.id)];
    if (!presence) return '';
    if (presence.is_online) return 'online';
    if (!presence.last_seen_at) return '';

    const date = new Date(presence.last_seen_at);
    const isToday = date.toDateString() === new Date().toDateString();
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return isToday ? `last seen today at ${time}` : `last seen ${date.toLocaleDateString([], { day: '2-digit', month: 'short' })} at ${time}`;
});
</script>

<template>
    <div class="cv-chat-header flex items-center gap-2 border-b border-converse-border bg-converse-surface px-3 py-2">
        <button type="button" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover sm:hidden" @click="emit('back')">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12Z"/></svg>
        </button>

        <div class="cv-chat-header__info flex flex-1 cursor-pointer items-center gap-3 overflow-hidden" @click="emit('open-info')">
            <Avatar :name="displayName" :avatar-url="avatarUrl" :size="40" />
            <div class="cv-chat-header__meta min-w-0">
                <p class="truncate font-medium leading-tight">{{ displayName }}</p>
                <p v-if="typingUsers.length" class="truncate text-xs text-converse-accent">{{ typingUsers.join(', ') }} typing&hellip;</p>
                <p v-else-if="subtitle" class="truncate text-xs text-converse-textMuted">{{ subtitle }}</p>
            </div>
        </div>

        <div class="cv-chat-header__actions flex items-center gap-1">
            <button
                type="button"
                title="Search in chat"
                class="flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                :class="{ 'text-converse-accent': searchOpen }"
                @click="emit('toggle-search')"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"/></svg>
            </button>
            <button
                type="button"
                title="Chat info"
                class="flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                @click="emit('open-info')"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>
            </button>
        </div>
    </div>
</template>
