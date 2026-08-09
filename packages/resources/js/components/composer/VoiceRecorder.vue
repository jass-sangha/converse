<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { useMessages } from '../../composables/useMessages';

const emit = defineEmits(['recorded', 'recording-change']);

const { uploadAttachment } = useMessages();

const recording = ref(false);
const seconds = ref(0);
const bars = ref(Array.from({ length: 32 }, () => 25));

let mediaRecorder = null;
let chunks = [];
let startedAt = 0;
let secondsTimer = null;
let barTimer = null;
let cancelled = false;

function formatTime(value) {
    const m = Math.floor(value / 60).toString().padStart(2, '0');
    const s = Math.floor(value % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];
    cancelled = false;
    startedAt = Date.now();
    seconds.value = 0;

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
        recording.value = false;
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(secondsTimer);
        clearInterval(barTimer);
        emit('recording-change', false);

        if (cancelled) return;

        const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });

        const attachment = await uploadAttachment(file);
        emit('recorded', { attachment, durationSeconds });
    };

    mediaRecorder.start();
    recording.value = true;
    emit('recording-change', true);

    secondsTimer = setInterval(() => {
        seconds.value = Math.floor((Date.now() - startedAt) / 1000);
    }, 250);

    barTimer = setInterval(() => {
        bars.value = bars.value.map(() => 20 + Math.random() * 80);
    }, 220);
}

function stopAndSend() {
    mediaRecorder?.stop();
}

function cancel() {
    cancelled = true;
    mediaRecorder?.stop();
}

onBeforeUnmount(() => {
    clearInterval(secondsTimer);
    clearInterval(barTimer);
    if (recording.value) {
        cancelled = true;
        mediaRecorder?.stop();
    }
});
</script>

<template>
    <button
        v-if="!recording"
        type="button"
        title="Record a voice message"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover hover:text-converse-accent"
        @click="start"
    >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12Z"/></svg>
    </button>

    <div v-else class="cv-voice-recorder flex flex-1 items-center gap-3">
        <button type="button" title="Cancel" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-converse-danger hover:bg-converse-surfaceHover" @click="cancel">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 3v1H4v2h16V4h-5V3H9Zm-3 6 1 12h10l1-12H6Z"/></svg>
        </button>

        <span class="flex shrink-0 items-center gap-1.5 text-sm text-converse-danger">
            <span class="h-2 w-2 animate-pulse rounded-full bg-converse-danger" />
            {{ formatTime(seconds) }}
        </span>

        <div class="flex h-6 flex-1 items-center gap-[2px] overflow-hidden rounded-full bg-converse-surfaceHover px-2">
            <span
                v-for="(height, index) in bars"
                :key="index"
                class="w-[2px] shrink-0 rounded-full bg-converse-accent"
                :style="{ height: height + '%' }"
            />
        </div>

        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="shrink-0 text-converse-textMuted"><path d="M12 1a4 4 0 0 0-4 4v3H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm-2 7V5a2 2 0 1 1 4 0v3Z"/></svg>

        <button type="button" title="Send" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-converse-accent text-white" @click="stopAndSend">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2 21 23 12 2 3v7l15 2-15 2Z"/></svg>
        </button>
    </div>
</template>
