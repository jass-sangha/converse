<script setup>
import { computed, onMounted, watch } from 'vue';
import AvatarPhotoControl from '../shared/AvatarPhotoControl.vue';
import { useChatStore } from '../../store';
import { chatableKey, chatableKeyOf } from '../../chatable';
import { useUsers } from '../../composables/useUsers';
import { usePresence } from '../../composables/usePresence';
import { useCall } from '../../composables/useCall';
import Icon from '../shared/Icon.vue';

const props = defineProps({
    conversation: { type: Object, required: true },
    searchOpen: { type: Boolean, default: false },
});

const emit = defineEmits(['back', 'open-info', 'toggle-search']);

const store = useChatStore();
const { resolve, get } = useUsers();
const { fetchPresence } = usePresence();
const { startCall } = useCall();

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

const isOnline = computed(() => {
    if (props.conversation.type !== 'private' || !otherParticipant.value) return false;
    const key = chatableKey(otherParticipant.value.type, otherParticipant.value.id);
    return !!store.presenceByUser[key]?.is_online;
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
    <div class="chat-chat-header flex items-center gap-3.5 border-b border-riwaaq-border bg-riwaaq-surface px-5 py-[13px]">
        <button type="button" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover sm:hidden" @click="emit('back')">
            <Icon name="back" :size="22" />
        </button>

        <div class="chat-chat-header__info flex flex-1 cursor-pointer items-center gap-3 overflow-hidden" @click="emit('open-info')">
            <div class="relative shrink-0">
                <AvatarPhotoControl :name="displayName" :avatar-url="avatarUrl" :size="44" @click.stop />
                <span
                    v-if="isOnline"
                    class="pointer-events-none absolute bottom-0 right-0 h-[13px] w-[13px] rounded-full border-[2.5px] border-riwaaq-surface bg-riwaaq-sage"
                />
            </div>
            <div class="chat-chat-header__meta min-w-0">
                <p class="truncate font-medium leading-tight">{{ displayName }}</p>
                <p v-if="subtitle" class="truncate text-xs text-riwaaq-textMuted">{{ subtitle }}</p>
            </div>
        </div>

        <div class="chat-chat-header__actions flex items-center gap-1">
            <button
                type="button"
                title="Voice call"
                class="flex h-9 w-9 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover"
                @click="startCall(conversation, { video: false })"
            >
                <Icon name="phone-accept" :size="19" />
            </button>
            <button
                type="button"
                title="Video call"
                class="flex h-9 w-9 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover"
                @click="startCall(conversation, { video: true })"
            >
                <Icon name="video-camera" :size="19" />
            </button>
            <button
                type="button"
                title="Search in chat"
                class="flex h-9 w-9 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover"
                :class="{ 'text-riwaaq-accent': searchOpen }"
                @click="emit('toggle-search')"
            >
                <Icon name="search" :size="20" />
            </button>
            <button
                type="button"
                title="Chat info"
                class="flex h-9 w-9 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover"
                @click="emit('open-info')"
            >
                <Icon name="more-vertical" :size="19" />
            </button>
        </div>
    </div>
</template>
