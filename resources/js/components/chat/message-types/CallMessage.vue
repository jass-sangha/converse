<script setup>
import { computed } from "vue";
import Icon from "../../shared/Icon.vue";

const props = defineProps({
    message: { type: Object, required: true },
});

const isVideo = computed(() => !!props.message.metadata?.video);
const participants = computed(() => props.message.metadata?.participants ?? []);
// The other side(s) of the call, not counting the viewer's own participation in it.
const joinedCount = computed(() => participants.value.length + 1);

const label = computed(() => (isVideo.value ? "Video call" : "Voice call"));

const durationLabel = computed(() => {
    const s = Math.max(
        0,
        Math.round(props.message.metadata?.duration_seconds ?? 0),
    );
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
});

// Nobody else ever connected — "1 joined" here would just be the caller talking to an empty
// room, which reads as "someone joined" when the truer story is "no answer".
const detailLabel = computed(() =>
    participants.value.length === 0
        ? "No answer"
        : `${durationLabel.value} · ${joinedCount.value} joined`,
);
</script>

<template>
    <div class="chat-call-message flex items-center gap-2.5 py-0.5">
        <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-riwaaq-surfaceHover text-riwaaq-sage"
        >
            <Icon :name="isVideo ? 'video-camera' : 'phone-accept'" :size="16" />
        </span>
        <span class="min-w-0">
            <span class="block text-sm font-medium text-riwaaq-text pr-4">{{
                label
            }}</span>
            <span class="block text-xs text-riwaaq-textMuted">{{
                detailLabel
            }}</span>
        </span>
    </div>
</template>
