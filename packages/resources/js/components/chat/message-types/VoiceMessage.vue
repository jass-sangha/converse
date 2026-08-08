<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    message: { type: Object, required: true },
});

const audioEl = ref(null);
const playing = ref(false);

const attachment = computed(() => props.message.attachments?.[0] ?? null);

const bars = computed(() => {
    const waveform = props.message.metadata?.waveform;
    if (Array.isArray(waveform) && waveform.length) {
        return waveform;
    }
    // Deterministic filler pattern when no real waveform data is available.
    return Array.from({ length: 24 }, (_, i) => 4 + ((i * 7) % 16));
});

function toggle() {
    if (!audioEl.value) return;

    if (playing.value) {
        audioEl.value.pause();
    } else {
        audioEl.value.play();
    }
}
</script>

<template>
    <div class="cv-voice-message flex items-center gap-2">
        <button
            type="button"
            class="cv-voice-message__toggle flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-converse-accent text-white"
            @click="toggle"
        >
            {{ playing ? '❚❚' : '▶' }}
        </button>

        <div class="cv-voice-message__waveform flex h-6 flex-1 items-end gap-0.5">
            <span
                v-for="(height, i) in bars"
                :key="i"
                class="cv-voice-message__bar w-0.5 rounded bg-converse-accent/60"
                :style="{ height: height + 'px' }"
            />
        </div>

        <audio
            v-if="attachment"
            ref="audioEl"
            :src="attachment.url"
            class="hidden"
            @play="playing = true"
            @pause="playing = false"
            @ended="playing = false"
        />
    </div>
</template>
