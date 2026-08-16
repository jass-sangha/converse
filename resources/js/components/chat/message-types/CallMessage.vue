<script setup>
import { computed } from "vue";

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
    <div class="cv-call-message flex items-center gap-2.5 py-0.5">
        <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-converse-surfaceHover text-converse-sage"
        >
            <svg
                v-if="isVideo"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <rect x="2.5" y="6" width="13" height="12" rx="3" />
                <path d="M15.5 11l6-3.2v8.4l-6-3.2Z" />
            </svg>
            <svg
                v-else
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path
                    d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"
                />
            </svg>
        </span>
        <span class="min-w-0">
            <span class="block text-sm font-medium text-converse-text pr-4">{{
                label
            }}</span>
            <span class="block text-xs text-converse-textMuted">{{
                detailLabel
            }}</span>
        </span>
    </div>
</template>
