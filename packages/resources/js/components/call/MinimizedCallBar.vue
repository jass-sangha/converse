<script setup>
import { computed, onMounted, watch } from "vue";
import { useCall } from "../../composables/useCall";
import { useUsers } from "../../composables/useUsers";

const { phase, announcer, peers, isGroupCall, minimized, elapsed, restore, endCall } = useCall();
const { resolve, get } = useUsers();

const soloRef = computed(() => {
    if (peers.value.length === 1) return peers.value[0];
    if (peers.value.length === 0 && announcer.value) return announcer.value;
    return null;
});

async function ensureResolved() {
    if (soloRef.value) {
        await resolve([soloRef.value]);
    }
}

onMounted(ensureResolved);
watch(soloRef, ensureResolved);

const label = computed(() => {
    if (soloRef.value) return get(soloRef.value).name ?? "Call";
    if (isGroupCall.value) return peers.value.length ? `${peers.value.length + 1} in call` : "Group call";
    return "Call";
});

const visible = computed(
    () =>
        minimized.value &&
        ["outgoing", "incoming", "connecting", "live"].includes(phase.value),
);

const statusLabel = computed(() => {
    if (phase.value === "live") {
        const s = Math.max(0, Math.round(elapsed.value));
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }
    return phase.value === "incoming" ? "Incoming call" : "Ringing…";
});
</script>

<template>
    <button
        v-if="visible"
        type="button"
        title="Return to call"
        class="cv-animate-pop-in fixed left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full border border-converse-border bg-converse-surface py-2.5 pl-3.5 pr-2.5 shadow-lg top-[calc(max(env(safe-area-inset-top),8px)+52px)] sm:left-24 sm:top-auto sm:bottom-6 sm:translate-x-0"
        @click="restore"
    >
        <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-converse-accent" />
        <span class="flex min-w-0 items-baseline gap-2">
            <span class="truncate text-sm font-bold text-converse-text">{{
                label
            }}</span>
            <span
                class="shrink-0 text-xs font-medium tabular-nums text-converse-textMuted"
                >{{ statusLabel }}</span
            >
        </span>
        <span
            title="End call"
            class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-converse-danger text-white"
            @click.stop="endCall()"
        >
            <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                stroke-width="2.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="transform: rotate(135deg)"
            >
                <path
                    d="M4.5 3.5h3.6l1.6 4-2.2 1.6a12.5 12.5 0 0 0 5.4 5.4l1.6-2.2 4 1.6v3.6a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 2.5 5.7a2 2 0 0 1 2-2.2Z"
                />
            </svg>
        </span>
    </button>
</template>
