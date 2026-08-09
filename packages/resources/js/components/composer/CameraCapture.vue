<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import Modal from '../shared/Modal.vue';
import { useMessages } from '../../composables/useMessages';

const emit = defineEmits(['close', 'uploaded']);

const { uploadAttachment } = useMessages();
const videoEl = ref(null);
const error = ref('');
const uploading = ref(false);
let stream = null;

onMounted(async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoEl.value) videoEl.value.srcObject = stream;
    } catch {
        error.value = 'Could not access the camera.';
    }
});

onBeforeUnmount(() => {
    stream?.getTracks().forEach((track) => track.stop());
});

async function capture() {
    if (!videoEl.value) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.value.videoWidth;
    canvas.height = videoEl.value.videoHeight;
    canvas.getContext('2d').drawImage(videoEl.value, 0, 0);

    uploading.value = true;
    try {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const attachment = await uploadAttachment(file);
        emit('uploaded', { attachment, type: 'image' });
        emit('close');
    } finally {
        uploading.value = false;
    }
}
</script>

<template>
    <Modal class="cv-camera-capture" title="Camera" @close="emit('close')">
        <p v-if="error" class="text-sm text-converse-danger">{{ error }}</p>
        <video v-else ref="videoEl" autoplay playsinline class="w-full rounded-cv bg-converse-overlay" />

        <template #footer>
            <button
                type="button"
                class="w-full rounded bg-converse-accent py-2 text-sm font-medium text-white disabled:opacity-50"
                :disabled="!!error || uploading"
                @click="capture"
            >
                {{ uploading ? 'Uploading…' : 'Capture & send' }}
            </button>
        </template>
    </Modal>
</template>
