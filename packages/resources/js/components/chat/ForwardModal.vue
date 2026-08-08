<script setup>
import { ref } from 'vue';
import Modal from '../shared/Modal.vue';
import Avatar from '../shared/Avatar.vue';
import { useChatStore } from '../../store';
import { useUsers } from '../../composables/useUsers';
import { useMessages } from '../../composables/useMessages';

const props = defineProps({
    messageId: { type: Number, required: true },
});

const emit = defineEmits(['close', 'forwarded']);

const store = useChatStore();
const { get } = useUsers();
const { forward } = useMessages();

const selected = ref([]);

function displayName(conversation) {
    if (conversation.type === 'group') return conversation.name || 'Group';
    const other = (conversation.participants ?? []).find((p) => p.user_id !== store.currentUserId);
    return other ? get(other.user_id).name : 'Unknown';
}

function toggle(id) {
    selected.value = selected.value.includes(id)
        ? selected.value.filter((i) => i !== id)
        : [...selected.value, id];
}

async function send() {
    if (!selected.value.length) return;
    await forward(props.messageId, selected.value);
    emit('forwarded');
    emit('close');
}
</script>

<template>
    <Modal class="cv-forward-modal" title="Forward message" @close="emit('close')">
        <ul class="cv-forward-modal__list max-h-72 overflow-y-auto">
            <li
                v-for="conversation in store.conversations"
                :key="conversation.id"
                class="cv-forward-modal__item flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-converse-surfaceHover"
                :class="{ 'bg-converse-bubbleOut': selected.includes(conversation.id) }"
                @click="toggle(conversation.id)"
            >
                <Avatar :name="displayName(conversation)" :avatar-url="conversation.avatar_url" :size="32" />
                <span class="text-sm">{{ displayName(conversation) }}</span>
            </li>
        </ul>

        <template #footer>
            <button
                type="button"
                class="cv-forward-modal__submit w-full rounded bg-converse-accent py-2 text-sm font-medium text-white disabled:opacity-50"
                :disabled="!selected.length"
                @click="send"
            >
                Forward
            </button>
        </template>
    </Modal>
</template>
