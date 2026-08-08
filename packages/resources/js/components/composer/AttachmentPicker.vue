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
        <button
            type="button"
            title="Attach"
            class="flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover hover:text-converse-accent disabled:opacity-50"
            :disabled="uploading"
            @click="open"
        >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z"/></svg>
        </button>
        <input ref="inputEl" type="file" multiple class="hidden" @change="onChange">
    </div>
</template>
