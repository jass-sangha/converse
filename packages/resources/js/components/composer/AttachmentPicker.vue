<script setup>
import { ref } from 'vue';
import { useMessages } from '../../composables/useMessages';

const emit = defineEmits(['uploaded']);

const { uploadAttachment } = useMessages();
const inputEl = ref(null);
const uploading = ref(false);

function open() {
    inputEl.value?.click();
}

async function onChange(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    uploading.value = true;
    try {
        for (const file of files) {
            const attachment = await uploadAttachment(file);
            const type = attachment.mime_type.startsWith('image/')
                ? 'image'
                : attachment.mime_type.startsWith('video/')
                    ? 'video'
                    : attachment.mime_type.startsWith('audio/')
                        ? 'audio'
                        : 'document';

            emit('uploaded', { attachment, type });
        }
    } finally {
        uploading.value = false;
    }
}
</script>

<template>
    <div class="cv-attachment-picker">
        <button type="button" class="text-xl text-converse-textMuted hover:text-converse-accent" :disabled="uploading" @click="open">📎</button>
        <input ref="inputEl" type="file" multiple class="hidden" @change="onChange">
    </div>
</template>
