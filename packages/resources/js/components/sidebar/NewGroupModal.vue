<script setup>
import { ref } from 'vue';
import Modal from '../shared/Modal.vue';
import UserPicker from '../shared/UserPicker.vue';
import { useConversations } from '../../composables/useConversations';

const emit = defineEmits(['close', 'created']);

const name = ref('');
const description = ref('');
const selected = ref([]);
const { createGroup, setActive } = useConversations();

async function create() {
    if (!name.value.trim() || selected.value.length < 1) return;

    const conversation = await createGroup(name.value.trim(), description.value.trim() || null, selected.value.map((u) => u.id));
    setActive(conversation.id);
    emit('created', conversation);
    emit('close');
}
</script>

<template>
    <Modal class="cv-new-group-modal" title="New group" @close="emit('close')">
        <input
            v-model="name"
            type="text"
            placeholder="Group name"
            class="cv-new-group-modal__name-input mb-2 w-full rounded border border-converse-border px-3 py-2 text-sm focus:border-converse-accent focus:outline-none"
        >
        <input
            v-model="description"
            type="text"
            placeholder="Description (optional)"
            class="cv-new-group-modal__description-input mb-3 w-full rounded border border-converse-border px-3 py-2 text-sm focus:border-converse-accent focus:outline-none"
        >
        <UserPicker v-model="selected" :multiple="true" />

        <template #footer>
            <button
                type="button"
                class="cv-new-group-modal__submit w-full rounded bg-converse-accent py-2 text-sm font-medium text-white disabled:opacity-50"
                :disabled="!name.trim() || !selected.length"
                @click="create"
            >
                Create group
            </button>
        </template>
    </Modal>
</template>
