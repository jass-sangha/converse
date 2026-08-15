<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useMessages } from '../../composables/useMessages';

const emit = defineEmits(['recorded', 'recording-change']);

const { uploadAttachment } = useMessages();

const phase = ref('idle'); // 'idle' | 'recording' | 'preview'
const seconds = ref(0);
const bars = ref(Array.from({ length: 32 }, () => 25));

const audioEl = ref(null);
const previewUrl = ref(null);
const playing = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const sending = ref(false);

let mediaRecorder = null;
let chunks = [];
let recordedBlob = null;
let startedAt = 0;
let secondsTimer = null;
let barTimer = null;

function formatTime(value) {
    const m = Math.floor(value / 60).toString().padStart(2, '0');
    const s = Math.floor(value % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function setPhase(next) {
    phase.value = next;
    emit('recording-change', next !== 'idle');
}

async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];
    startedAt = Date.now();
    seconds.value = 0;

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(secondsTimer);
        clearInterval(barTimer);

        // Cancelled recordings never reach here in the 'recording' phase — cancel() already
        // moved the phase back to 'idle' before stopping the recorder.
        if (phase.value !== 'recording') return;

        recordedBlob = new Blob(chunks, { type: 'audio/webm' });
        duration.value = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        previewUrl.value = URL.createObjectURL(recordedBlob);
        setPhase('preview');
    };

    mediaRecorder.start();
    setPhase('recording');

    secondsTimer = setInterval(() => {
        seconds.value = Math.floor((Date.now() - startedAt) / 1000);
    }, 250);

    barTimer = setInterval(() => {
        bars.value = bars.value.map(() => 20 + Math.random() * 80);
    }, 220);
}

function stopRecording() {
    mediaRecorder?.stop();
}

function cancelRecording() {
    setPhase('idle');
    mediaRecorder?.stop();
}

function resetPreview() {
    audioEl.value?.pause();
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
    recordedBlob = null;
    playing.value = false;
    currentTime.value = 0;
    duration.value = 0;
}

function discardPreview() {
    resetPreview();
    setPhase('idle');
}

function togglePlay() {
    if (!audioEl.value) return;
    if (playing.value) {
        audioEl.value.pause();
    } else {
        audioEl.value.play();
    }
}

function onTimeUpdate() {
    if (audioEl.value) currentTime.value = audioEl.value.currentTime;
}

function onEnded() {
    playing.value = false;
    currentTime.value = 0;
}

function seek(event) {
    if (!audioEl.value || !duration.value) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audioEl.value.currentTime = frac * duration.value;
    currentTime.value = audioEl.value.currentTime;
}

const progressPct = computed(() => {
    if (!duration.value) return 0;
    return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100));
});

async function send() {
    if (!recordedBlob || sending.value) return;
    sending.value = true;

    const file = new File([recordedBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
    const durationSeconds = Math.round(duration.value);
    const attachment = await uploadAttachment(file);

    sending.value = false;
    resetPreview();
    setPhase('idle');
    emit('recorded', { attachment, durationSeconds });
}

onBeforeUnmount(() => {
    clearInterval(secondsTimer);
    clearInterval(barTimer);
    if (phase.value === 'recording') {
        mediaRecorder?.stop();
    }
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
    <button
        v-if="phase === 'idle'"
        type="button"
        title="Record a voice message"
        class="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-converse-accent text-converse-accentContrast shadow-sm"
        @click="start"
    >
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/></svg>
    </button>

    <div v-else-if="phase === 'recording'" class="cv-voice-recorder flex flex-1 items-center gap-3">
        <button type="button" title="Cancel" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-converse-danger hover:bg-converse-surfaceHover" @click="cancelRecording">
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

        <button type="button" title="Stop recording" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-converse-accent text-converse-accentContrast" @click="stopRecording">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
        </button>
    </div>

    <div v-else class="cv-voice-recorder-preview flex flex-1 items-center gap-2.5">
        <span class="h-2 w-2 shrink-0 rounded-full bg-converse-accent" />

        <span class="shrink-0 text-sm tabular-nums text-converse-textMuted">{{ formatTime(playing ? currentTime : duration) }}</span>

        <div
            class="relative h-6 flex-1 cursor-pointer"
            @pointerdown="seek"
        >
            <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-converse-border" />
            <div
                class="absolute top-1/2 -translate-y-1/2 border-t-2 border-solid border-converse-accent"
                :style="{ width: progressPct + '%' }"
            />
            <div
                class="absolute top-1/2 h-2.5 w-2.5 -ml-1.5 -translate-y-1/2 rounded-full bg-converse-accent shadow"
                :style="{ left: progressPct + '%' }"
            />
        </div>

        <button
            type="button"
            title="Discard"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover hover:text-converse-danger"
            @click="discardPreview"
        >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M9 3v1H4v2h16V4h-5V3H9Zm-3 6 1 12h10l1-12H6Z"/></svg>
        </button>

        <button
            type="button"
            :title="playing ? 'Pause' : 'Play'"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover hover:text-converse-accentText"
            @click="togglePlay"
        >
            <svg v-if="playing" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.4" /><rect x="13.5" y="5" width="4" height="14" rx="1.4" /></svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5.5l11 6.5-11 6.5Z" /></svg>
        </button>

        <button
            type="button"
            title="Send"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-converse-accent text-converse-accentContrast disabled:opacity-60"
            :disabled="sending"
            @click="send"
        >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M2 21 23 12 2 3v7l15 2-15 2Z"/></svg>
        </button>

        <audio
            v-if="previewUrl"
            ref="audioEl"
            :src="previewUrl"
            class="hidden"
            @play="playing = true"
            @pause="playing = false"
            @ended="onEnded"
            @timeupdate="onTimeUpdate"
        />
    </div>
</template>
