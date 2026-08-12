<script setup>
import { computed, ref } from 'vue';
import Modal from '../shared/Modal.vue';

const emit = defineEmits(['close', 'create']);

const title = ref('');
const startsAt = ref('');
const location = ref('');
const description = ref('');
const submitting = ref(false);

const canSubmit = computed(() => title.value.trim().length > 0 && startsAt.value.length > 0);

async function submit() {
    if (!canSubmit.value || submitting.value) return;

    submitting.value = true;
    try {
        emit('create', {
            title: title.value.trim(),
            starts_at: new Date(startsAt.value).toISOString(),
            location: location.value.trim() || null,
            description: description.value.trim() || null,
        });
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <Modal title="Create event" @close="emit('close')">
        <label class="mb-1 block text-xs font-medium uppercase text-converse-textMuted">Title</label>
        <input
            v-model="title"
            type="text"
            maxlength="255"
            placeholder="Event title"
            class="mb-4 w-full border-b border-converse-border bg-transparent pb-2 text-[15px] text-converse-text focus:border-converse-accent focus:outline-none"
        >

        <label class="mb-1 block text-xs font-medium uppercase text-converse-textMuted">Date &amp; time</label>
        <input
            v-model="startsAt"
            type="datetime-local"
            class="mb-4 w-full rounded-cv border border-converse-border bg-transparent px-3 py-1.5 text-sm text-converse-text focus:border-converse-accent focus:outline-none"
        >

        <label class="mb-1 block text-xs font-medium uppercase text-converse-textMuted">Location (optional)</label>
        <input
            v-model="location"
            type="text"
            maxlength="255"
            placeholder="Where?"
            class="mb-4 w-full rounded-cv border border-converse-border bg-transparent px-3 py-1.5 text-sm text-converse-text focus:border-converse-accent focus:outline-none"
        >

        <label class="mb-1 block text-xs font-medium uppercase text-converse-textMuted">Description (optional)</label>
        <textarea
            v-model="description"
            maxlength="1000"
            rows="3"
            placeholder="Add details"
            class="w-full rounded-cv border border-converse-border bg-transparent px-3 py-1.5 text-sm text-converse-text focus:border-converse-accent focus:outline-none"
        />

        <template #footer>
            <button
                type="button"
                class="w-full rounded bg-converse-accent py-1.5 text-sm text-white disabled:opacity-50"
                :disabled="!canSubmit || submitting"
                @click="submit"
            >
                Create event
            </button>
        </template>
    </Modal>
</template>
