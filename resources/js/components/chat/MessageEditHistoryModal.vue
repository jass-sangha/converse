<script setup>
import { onMounted, ref } from 'vue';
import Modal from '../shared/Modal.vue';
import { useMessages } from '../../composables/useMessages';

const props = defineProps({
    message: { type: Object, required: true },
});

const emit = defineEmits(['close']);

const { editHistory } = useMessages();

const loading = ref(true);
const edits = ref([]);

onMounted(async () => {
    edits.value = await editHistory(props.message.id);
    loading.value = false;
});

function formatTime(at) {
    return new Date(at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}
</script>

<template>
    <Modal class="chat-message-edit-history-modal" title="Edit history" @close="emit('close')">
        <p v-if="loading" class="text-sm text-riwaaq-textMuted">Loading&hellip;</p>

        <template v-else>
            <div class="flex flex-col gap-3">
                <div v-for="edit in edits" :key="edit.id" class="rounded-chat border border-riwaaq-border p-2.5">
                    <p class="whitespace-pre-wrap break-words text-sm text-riwaaq-text">{{ edit.previous_body }}</p>
                    <p class="mt-1 text-xs text-riwaaq-textMuted">Edited {{ formatTime(edit.edited_at) }}</p>
                </div>

                <div class="rounded-chat border border-riwaaq-accent/40 bg-riwaaq-accent/5 p-2.5">
                    <p class="whitespace-pre-wrap break-words text-sm text-riwaaq-text">{{ message.body }}</p>
                    <p class="mt-1 text-xs text-riwaaq-accentText">Current</p>
                </div>
            </div>

            <p v-if="!edits.length" class="mt-2 text-xs text-riwaaq-textMuted">This is the only edit on record.</p>
        </template>
    </Modal>
</template>
