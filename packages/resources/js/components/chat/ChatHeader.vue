<script setup>
import { computed, onMounted, watch } from 'vue';
import Avatar from '../shared/Avatar.vue';
import PresenceDot from '../shared/PresenceDot.vue';
import { useChatStore } from '../../store';
import { useUsers } from '../../composables/useUsers';
import { usePresence } from '../../composables/usePresence';

const props = defineProps({
    conversation: { type: Object, required: true },
});

const emit = defineEmits(['back', 'open-info']);

const store = useChatStore();
const { resolve, get } = useUsers();
const { fetchPresence } = usePresence();

const otherParticipantId = computed(() => {
    if (props.conversation.type !== 'private') return null;
    const other = (props.conversation.participants ?? []).find((p) => p.user_id !== store.currentUserId);
    return other?.user_id ?? null;
});

async function ensureResolved() {
    if (otherParticipantId.value) {
        await Promise.all([resolve([otherParticipantId.value]), fetchPresence(otherParticipantId.value)]);
    }
}

onMounted(ensureResolved);
watch(otherParticipantId, ensureResolved);

const displayName = computed(() => {
    if (props.conversation.type === 'group') return props.conversation.name || 'Group';
    return otherParticipantId.value ? get(otherParticipantId.value).name : 'Unknown';
});

const avatarUrl = computed(() => {
    if (props.conversation.avatar_url) return props.conversation.avatar_url;
    return otherParticipantId.value ? get(otherParticipantId.value).avatar_url : null;
});

const typingUsers = computed(() => {
    const set = store.typingByConversation[props.conversation.id];
    if (!set || !set.size) return [];
    return Array.from(set).map((id) => get(id).name);
});
</script>

<template>
    <div class="cv-chat-header flex items-center gap-3 border-b border-converse-border bg-converse-surface px-3 py-2">
        <button type="button" class="sm:hidden" @click="emit('back')">←</button>

        <div class="cv-chat-header__info flex flex-1 cursor-pointer items-center gap-3" @click="emit('open-info')">
            <Avatar :name="displayName" :avatar-url="avatarUrl" :size="40" />
            <div class="cv-chat-header__meta min-w-0">
                <p class="truncate font-medium">{{ displayName }}</p>
                <p v-if="typingUsers.length" class="text-xs text-converse-accent">{{ typingUsers.join(', ') }} typing&hellip;</p>
                <PresenceDot v-else-if="otherParticipantId" :user-id="otherParticipantId" />
            </div>
        </div>
    </div>
</template>
