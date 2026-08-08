<script setup>
import { ref } from 'vue';
import { useMessages } from '../../composables/useMessages';

const emit = defineEmits(['recorded']);

const { uploadAttachment } = useMessages();

const recording = ref(false);
let mediaRecorder = null;
let chunks = [];
let startedAt = 0;

async function toggle() {
    if (recording.value) {
        mediaRecorder?.stop();
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];
    startedAt = Date.now();

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
        recording.value = false;
        stream.getTracks().forEach((t) => t.stop());

        const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });

        const attachment = await uploadAttachment(file);
        emit('recorded', { attachment, durationSeconds });
    };

    mediaRecorder.start();
    recording.value = true;
}
</script>

<template>
    <button
        type="button"
        class="cv-voice-recorder text-xl"
        :class="recording ? 'text-converse-danger' : 'text-converse-textMuted hover:text-converse-accent'"
        @click="toggle"
    >
        {{ recording ? '⏹' : '🎤' }}
    </button>
</template>
