<script setup>
import { ref, computed } from 'vue';
import Icon from '../../shared/Icon.vue';

const props = defineProps({
    message: { type: Object, required: true },
    isOwn: { type: Boolean, default: false },
});

const audioEl = ref(null);
const playing = ref(false);
const currentTime = ref(0);
const duration = ref(Number(props.message.metadata?.duration) || 0);
const rate = ref(1);

const attachment = computed(() => props.message.attachments?.[0] ?? null);

const progressPct = computed(() => {
    if (!duration.value) return 0;
    return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100));
});

function fmt(seconds) {
    const s = Math.max(0, Math.round(seconds || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function toggle() {
    if (!audioEl.value) return;

    if (playing.value) {
        audioEl.value.pause();
    } else {
        audioEl.value.play();
    }
}

function onLoadedMetadata() {
    if (audioEl.value && Number.isFinite(audioEl.value.duration)) {
        duration.value = audioEl.value.duration;
    }
}

function onTimeUpdate() {
    if (audioEl.value) currentTime.value = audioEl.value.currentTime;
}

function seek(event) {
    if (!audioEl.value || !duration.value) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audioEl.value.currentTime = frac * duration.value;
    currentTime.value = audioEl.value.currentTime;
}

function cycleRate() {
    rate.value = rate.value === 1 ? 1.5 : rate.value === 1.5 ? 2 : 1;
    if (audioEl.value) audioEl.value.playbackRate = rate.value;
}
</script>

<template>
    <div class="chat-voice-message flex w-full items-center gap-3 py-0.5 pb-1">
        <button
            type="button"
            :title="playing ? 'Pause' : 'Play'"
            class="chat-voice-message__toggle flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full"
            :class="isOwn ? 'bg-riwaaq-accent text-riwaaq-accentContrast hover:opacity-90' : 'bg-riwaaq-sage text-riwaaq-sageContrast hover:opacity-90'"
            @click="toggle"
        >
            <Icon :name="playing ? 'pause' : 'play'" :size="16" />
        </button>

        <div class="min-w-0 flex-1">
            <div class="relative flex h-[22px] cursor-pointer items-center" @pointerdown="seek">
                <div class="absolute inset-x-0 h-1 rounded-full bg-riwaaq-border" />
                <div
                    class="absolute h-1 rounded-full"
                    :class="isOwn ? 'bg-riwaaq-accent' : 'bg-riwaaq-sage'"
                    :style="{ width: progressPct + '%' }"
                />
                <div
                    class="absolute h-[13px] w-[13px] -ml-1.5 rounded-full shadow"
                    :class="isOwn ? 'bg-riwaaq-accent' : 'bg-riwaaq-sage'"
                    :style="{ left: progressPct + '%' }"
                />
            </div>
            <div class="mt-px flex items-center justify-between gap-2">
                <span class="text-[11px] tabular-nums text-riwaaq-textDim">{{ fmt(currentTime) }}</span>
                <span class="text-[11px] tabular-nums text-riwaaq-textDim">{{ fmt(duration) }}</span>
            </div>
        </div>

        <button
            type="button"
            title="Playback speed"
            class="flex h-[26px] min-w-[38px] shrink-0 items-center justify-center rounded-full bg-riwaaq-surfaceHover px-[9px] text-[11.5px] font-bold text-riwaaq-textMuted hover:text-riwaaq-accentText"
            @click="cycleRate"
        >
            {{ rate }}&times;
        </button>

        <audio
            v-if="attachment"
            ref="audioEl"
            :src="attachment.url"
            class="hidden"
            @play="playing = true"
            @pause="playing = false"
            @ended="playing = false"
            @loadedmetadata="onLoadedMetadata"
            @timeupdate="onTimeUpdate"
        />
    </div>
</template>
