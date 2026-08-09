<script setup>
import { ref } from 'vue';
import Modal from '../shared/Modal.vue';
import UserPicker from '../shared/UserPicker.vue';
import Avatar from '../shared/Avatar.vue';
import { useConversations } from '../../composables/useConversations';

const emit = defineEmits(['close', 'created']);

const name = ref('');
const description = ref('');
const selected = ref([]);
const avatarFile = ref(null);
const avatarPreview = ref(null);
const creating = ref(false);
const { createGroup, updateAvatar, setActive } = useConversations();

function onAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);
}

async function create() {
    if (!name.value.trim() || selected.value.length < 1 || creating.value) return;

    creating.value = true;
    try {
        const conversation = await createGroup(name.value.trim(), description.value.trim() || null, selected.value);

        if (avatarFile.value) {
            await updateAvatar(conversation.id, avatarFile.value);
        }

        setActive(conversation.id);
        emit('created', conversation);
        emit('close');
    } finally {
        creating.value = false;
    }
}
</script>

<template>
    <Modal class="cv-new-group-modal" title="New group" @close="emit('close')">
        <div class="mb-3 flex justify-center">
            <label class="group relative cursor-pointer rounded-full">
                <Avatar :name="name || 'Group'" :avatar-url="avatarPreview" :size="72" />
                <span class="absolute inset-0 flex items-center justify-center rounded-full bg-converse-overlay/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-converse-overlay/40 group-hover:opacity-100">
                    Add photo
                </span>
                <input type="file" accept="image/*" class="hidden" @change="onAvatarChange">
            </label>
        </div>

        <input
            v-model="name"
            type="text"
            placeholder="Group name"
            class="cv-new-group-modal__name-input mb-2 w-full rounded border border-converse-border bg-converse-surface px-3 py-2 text-sm text-converse-text focus:border-converse-accent focus:outline-none"
        >
        <input
            v-model="description"
            type="text"
            placeholder="Description (optional)"
            class="cv-new-group-modal__description-input mb-3 w-full rounded border border-converse-border bg-converse-surface px-3 py-2 text-sm text-converse-text focus:border-converse-accent focus:outline-none"
        >
        <UserPicker v-model="selected" :multiple="true" />

        <template #footer>
            <button
                type="button"
                class="cv-new-group-modal__submit w-full rounded bg-converse-accent py-2 text-sm font-medium text-white disabled:opacity-50"
                :disabled="!name.trim() || !selected.length || creating"
                @click="create"
            >
                {{ creating ? 'Creating…' : 'Create group' }}
            </button>
        </template>
    </Modal>
</template>
