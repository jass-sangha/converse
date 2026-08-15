<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import Avatar from '../shared/Avatar.vue';
import { useCall } from '../../composables/useCall';
import { useUsers } from '../../composables/useUsers';

const {
    phase, announcer, peers, isGroupCall, video, muted, camOn, speakerOn, minimized, elapsed,
    localStream, acceptCall, declineCall, endCall,
    toggleMute, toggleCam, toggleSpeaker, minimize,
} = useCall();

const { resolve, get } = useUsers();

const localVideoEl = ref(null);

const refsToResolve = computed(() => {
    const refs = peers.value.map((p) => ({ type: p.type, id: p.id }));
    if (announcer.value) refs.push(announcer.value);
    return refs;
});

async function ensureResolved() {
    if (refsToResolve.value.length) {
        await resolve(refsToResolve.value);
    }
}

onMounted(ensureResolved);
watch(refsToResolve, ensureResolved);

// The single person to name/avatar in the header area: whoever we're ringing or being rung by
// before any mesh connection exists yet, or the other participant once exactly one has joined —
// true for a 1:1 call by definition, and looks/behaves identically for a group call that
// currently has just one other person in it. Only once a third person joins does this stop being
// meaningful and the grid/count view (see template) takes over instead.
const soloPerson = computed(() => {
    if (peers.value.length === 1) return get(peers.value[0]);
    if (peers.value.length === 0 && announcer.value) return get(announcer.value);
    return null;
});

const visible = computed(
    () => !minimized.value && ['outgoing', 'incoming', 'connecting', 'live'].includes(phase.value),
);

const statusLabel = computed(() => {
    switch (phase.value) {
        case 'outgoing': return 'Ringing…';
        case 'incoming': return video.value ? 'Incoming video call' : 'Incoming voice call';
        case 'connecting': return 'Connecting…';
        case 'live': {
            const s = Math.max(0, Math.round(elapsed.value));
            return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
        }
        default: return '';
    }
});

const titleLabel = computed(() => {
    if (soloPerson.value) return soloPerson.value.name ?? 'Unknown';
    if (isGroupCall.value) return peers.value.length ? `${peers.value.length + 1} in call` : 'Waiting for others to join…';
    return 'Unknown';
});

watch(localStream, (stream) => {
    if (localVideoEl.value) localVideoEl.value.srcObject = stream ?? null;
});
</script>

<template>
    <div
        v-if="visible"
        class="cv-call-overlay fixed inset-0 z-[70] flex flex-col items-center bg-gradient-to-b from-converse-surface via-converse-bg to-converse-bg"
    >
        <div class="flex w-full items-center justify-between gap-4 px-5 pb-0 pt-[max(env(safe-area-inset-top),20px)] sm:pt-6">
            <span class="text-xs font-bold uppercase tracking-wide text-converse-textMuted">
                {{ video ? 'Video call' : 'Voice call' }}{{ isGroupCall ? ' · Group' : '' }}
            </span>
            <button
                type="button"
                title="Hide call and keep talking"
                class="flex items-center gap-2 rounded-full border border-converse-border bg-converse-surface px-4 py-2 text-sm font-medium text-converse-text"
                @click="minimize"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 14h6v6M19 10h-6V4" /></svg>
                Hide
            </button>
        </div>

        <div class="flex flex-1 min-h-0 w-full flex-col items-center justify-center gap-6 px-6">
            <template v-if="video">
                <div class="relative w-full max-w-[760px] overflow-hidden rounded-[32px] bg-converse-railBg shadow-lg">
                    <div
                        class="grid gap-1"
                        :class="peers.length > 1 ? 'aspect-[16/10] grid-cols-2' : 'aspect-[16/10] grid-cols-1'"
                    >
                        <video
                            v-for="p in peers"
                            :key="p.key"
                            :ref="(el) => { if (el) el.srcObject = p.stream; }"
                            autoplay
                            playsinline
                            class="h-full w-full object-cover"
                        />
                        <div v-if="!peers.length" class="flex items-center justify-center">
                            <Avatar :name="soloPerson?.name ?? ''" :avatar-url="soloPerson?.avatar_url" :size="96" />
                        </div>
                    </div>
                    <div class="absolute bottom-4 right-4 aspect-[4/3] w-[150px] overflow-hidden rounded-2xl border-2 border-converse-surface bg-converse-railBg">
                        <video ref="localVideoEl" autoplay playsinline muted class="h-full w-full object-cover" />
                    </div>
                </div>
            </template>

            <template v-else-if="!isGroupCall || peers.length <= 1">
                <div class="relative grid place-items-center">
                    <div class="cv-animate-call-pulse absolute inset-0 rounded-full" />
                    <Avatar :name="soloPerson?.name ?? ''" :avatar-url="soloPerson?.avatar_url" :size="132" />
                </div>
            </template>

            <template v-else>
                <div class="flex flex-wrap items-center justify-center gap-5">
                    <div v-for="p in peers" :key="p.key" class="flex flex-col items-center gap-1.5">
                        <Avatar :name="get(p).name ?? ''" :avatar-url="get(p).avatar_url" :size="76" />
                        <span class="max-w-[90px] truncate text-xs text-converse-textMuted">{{ get(p).name }}</span>
                    </div>
                </div>
            </template>

            <div class="text-center">
                <div class="font-display text-3xl font-normal text-converse-text">{{ titleLabel }}</div>
                <div class="mt-2 text-sm font-semibold tabular-nums text-converse-textMuted">{{ statusLabel }}</div>
            </div>
        </div>

        <div class="flex items-center gap-4 px-6 pb-[max(env(safe-area-inset-bottom),28px)] sm:pb-10">
            <template v-if="phase === 'incoming'">
                <button
                    type="button"
                    title="Decline"
                    class="grid h-[58px] w-[58px] place-items-center rounded-full bg-converse-danger text-white shadow-lg"
                    @click="declineCall"
                >
                    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(135deg)"><path d="M4.5 3.5h3.6l1.6 4-2.2 1.6a12.5 12.5 0 0 0 5.4 5.4l1.6-2.2 4 1.6v3.6a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 2.5 5.7a2 2 0 0 1 2-2.2Z" /></svg>
                </button>
                <button
                    type="button"
                    title="Accept"
                    class="grid h-[58px] w-[58px] place-items-center rounded-full bg-converse-accent text-converse-accentContrast shadow-lg"
                    @click="acceptCall"
                >
                    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" /></svg>
                </button>
            </template>

            <template v-else>
                <button
                    type="button"
                    :title="muted ? 'Unmute' : 'Mute'"
                    class="grid h-[58px] w-[58px] place-items-center rounded-full border border-converse-border shadow"
                    :class="muted ? 'bg-converse-accent text-converse-accentContrast' : 'bg-converse-surface text-converse-text'"
                    @click="toggleMute"
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /><path v-if="muted" d="M3.5 3.5l17 17" /></svg>
                </button>
                <button
                    v-if="video"
                    type="button"
                    :title="camOn ? 'Stop video' : 'Start video'"
                    class="grid h-[58px] w-[58px] place-items-center rounded-full border border-converse-border shadow"
                    :class="camOn ? 'bg-converse-surface text-converse-text' : 'bg-converse-surfaceHover text-converse-textMuted'"
                    @click="toggleCam"
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="13" height="12" rx="3.5" /><path d="M15.5 11l6-3.5v9L15.5 13" /><path v-if="!camOn" d="M3.5 20.5 20.5 3.5" /></svg>
                </button>
                <button
                    type="button"
                    title="Speaker"
                    class="grid h-[58px] w-[58px] place-items-center rounded-full border border-converse-border shadow"
                    :class="speakerOn ? 'bg-converse-surface text-converse-text' : 'bg-converse-surfaceHover text-converse-textMuted'"
                    @click="toggleSpeaker"
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4Z" /><path d="M16 9.5a4.5 4.5 0 0 1 0 5M19 7a8 8 0 0 1 0 10" /><path v-if="!speakerOn" d="M3.5 3.5l17 17" /></svg>
                </button>
                <button
                    type="button"
                    title="End call"
                    class="flex h-[58px] items-center gap-2.5 rounded-full bg-converse-danger px-7 font-bold text-white shadow-lg"
                    @click="endCall()"
                >
                    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(135deg)"><path d="M4.5 3.5h3.6l1.6 4-2.2 1.6a12.5 12.5 0 0 0 5.4 5.4l1.6-2.2 4 1.6v3.6a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 2.5 5.7a2 2 0 0 1 2-2.2Z" /></svg>
                    End
                </button>
            </template>
        </div>
    </div>
</template>
