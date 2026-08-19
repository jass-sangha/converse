<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import Modal from '../shared/Modal.vue';
import { useMessages } from '../../composables/useMessages';

const props = defineProps({
    // When true (the default), the captured photo is uploaded as a chat attachment and
    // 'uploaded' is emitted. When false, the raw File is emitted via 'captured' instead,
    // for callers (e.g. avatar editing) that need to send it to a different endpoint.
    uploadAsAttachment: { type: Boolean, default: true },
});

const emit = defineEmits(['close', 'uploaded', 'captured']);

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

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

    if (!props.uploadAsAttachment) {
        emit('captured', file);
        emit('close');
        return;
    }

    uploading.value = true;
    try {
        const attachment = await uploadAttachment(file);
        emit('uploaded', { attachment, type: 'image' });
        emit('close');
    } finally {
        uploading.value = false;
    }
}
</script>

<template>
    <Modal class="chat-camera-capture" title="Camera" @close="emit('close')">
        <p v-if="error" class="text-sm text-riwaaq-danger">{{ error }}</p>
        <video v-else ref="videoEl" autoplay playsinline class="w-full rounded-chat bg-riwaaq-overlay" />

        <template #footer>
            <button
                type="button"
                class="w-full rounded bg-riwaaq-accent py-2 text-sm font-medium text-white disabled:opacity-50"
                :disabled="!!error || uploading"
                @click="capture"
            >
                {{ uploading ? 'Uploading…' : 'Capture & send' }}
            </button>
        </template>
    </Modal>
</template>
