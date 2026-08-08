<script setup>
import { ref } from 'vue';
import Modal from '../shared/Modal.vue';
import UserPicker from '../shared/UserPicker.vue';
import { useConversations } from '../../composables/useConversations';

const emit = defineEmits(['close', 'created']);

const selected = ref([]);
const { createPrivate, setActive } = useConversations();

async function start() {
    if (!selected.value.length) return;

    const conversation = await createPrivate(selected.value[0]);
    setActive(conversation.id);
    emit('created', conversation);
    emit('close');
}
</script>

<template>
    <Modal class="cv-new-chat-modal" title="New chat" @close="emit('close')">
        <UserPicker v-model="selected" :multiple="false" />

        <template #footer>
            <button
                type="button"
                class="cv-new-chat-modal__submit w-full rounded bg-converse-accent py-2 text-sm font-medium text-white disabled:opacity-50"
                :disabled="!selected.length"
                @click="start"
            >
                Start chat
            </button>
        </template>
    </Modal>
</template>
