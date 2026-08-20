<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import Avatar from '../shared/Avatar.vue';
import Icon from '../shared/Icon.vue';
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
        class="chat-call-overlay fixed inset-0 z-[70] flex flex-col items-center bg-gradient-to-b from-riwaaq-surface via-riwaaq-bg to-riwaaq-bg"
    >
        <div class="flex w-full items-center justify-between gap-4 px-5 pb-0 pt-[max(env(safe-area-inset-top),20px)] sm:pt-6">
            <span class="text-xs font-bold uppercase tracking-wide text-riwaaq-textMuted">
                {{ video ? 'Video call' : 'Voice call' }}{{ isGroupCall ? ' · Group' : '' }}
            </span>
            <button
                type="button"
                title="Hide call and keep talking"
                class="flex items-center gap-2 rounded-full border border-riwaaq-border bg-riwaaq-surface px-4 py-2 text-sm font-medium text-riwaaq-text"
                @click="minimize"
            >
                <Icon name="minimize" :size="16" />
                Hide
            </button>
        </div>

        <div class="flex flex-1 min-h-0 w-full flex-col items-center justify-center gap-6 px-6">
            <template v-if="video">
                <div class="relative w-full max-w-[760px] overflow-hidden rounded-chat-xl bg-riwaaq-railBg shadow-chat-lg">
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
                    <div class="absolute bottom-4 right-4 aspect-[4/3] w-[150px] overflow-hidden rounded-2xl border-2 border-riwaaq-surface bg-riwaaq-railBg">
                        <video ref="localVideoEl" autoplay playsinline muted class="h-full w-full object-cover" />
                    </div>
                </div>
            </template>

            <template v-else-if="!isGroupCall || peers.length <= 1">
                <div class="relative grid place-items-center">
                    <div class="chat-animate-call-pulse absolute inset-0 rounded-full" />
                    <Avatar :name="soloPerson?.name ?? ''" :avatar-url="soloPerson?.avatar_url" :size="132" />
                </div>
            </template>

            <template v-else>
                <div class="flex flex-wrap items-center justify-center gap-5">
                    <div v-for="p in peers" :key="p.key" class="flex flex-col items-center gap-1.5">
                        <Avatar :name="get(p).name ?? ''" :avatar-url="get(p).avatar_url" :size="76" />
                        <span class="max-w-[90px] truncate text-xs text-riwaaq-textMuted">{{ get(p).name }}</span>
                    </div>
                </div>
            </template>

            <div class="text-center">
                <div class="font-display text-3xl font-normal text-riwaaq-text">{{ titleLabel }}</div>
                <div class="mt-2 text-sm font-semibold tabular-nums text-riwaaq-textMuted">{{ statusLabel }}</div>
            </div>
        </div>

        <div class="flex items-center gap-4 px-6 pb-[max(env(safe-area-inset-bottom),28px)] sm:pb-10">
            <template v-if="phase === 'incoming'">
                <button
                    type="button"
                    title="Decline"
                    class="grid h-[58px] w-[58px] place-items-center rounded-full bg-riwaaq-danger text-white shadow-chat-lg"
                    @click="declineCall"
                >
                    <Icon name="phone" :size="21" style="transform: rotate(135deg)" />
                </button>
                <button
                    type="button"
                    title="Accept"
                    class="grid h-[58px] w-[58px] place-items-center rounded-full bg-riwaaq-accent text-riwaaq-accentContrast shadow-chat-lg"
                    @click="acceptCall"
                >
                    <Icon name="phone-accept" :size="21" />
                </button>
            </template>

            <template v-else>
                <button
                    type="button"
                    :title="muted ? 'Unmute' : 'Mute'"
                    class="grid h-[58px] w-[58px] place-items-center rounded-full border border-riwaaq-border shadow"
                    :class="muted ? 'bg-riwaaq-accent text-riwaaq-accentContrast' : 'bg-riwaaq-surface text-riwaaq-text'"
                    @click="toggleMute"
                >
                    <Icon :name="muted ? 'mic-muted' : 'mic'" :size="22" />
                </button>
                <button
                    v-if="video"
                    type="button"
                    :title="camOn ? 'Stop video' : 'Start video'"
                    class="grid h-[58px] w-[58px] place-items-center rounded-full border border-riwaaq-border shadow"
                    :class="camOn ? 'bg-riwaaq-surface text-riwaaq-text' : 'bg-riwaaq-surfaceHover text-riwaaq-textMuted'"
                    @click="toggleCam"
                >
                    <Icon :name="camOn ? 'camera' : 'camera-off'" :size="22" />
                </button>
                <button
                    type="button"
                    title="Speaker"
                    class="grid h-[58px] w-[58px] place-items-center rounded-full border border-riwaaq-border shadow"
                    :class="speakerOn ? 'bg-riwaaq-surface text-riwaaq-text' : 'bg-riwaaq-surfaceHover text-riwaaq-textMuted'"
                    @click="toggleSpeaker"
                >
                    <Icon :name="speakerOn ? 'speaker' : 'speaker-off'" :size="22" />
                </button>
                <button
                    type="button"
                    title="End call"
                    class="flex h-[58px] items-center gap-2.5 rounded-full bg-riwaaq-danger px-7 font-bold text-white shadow-chat-lg"
                    @click="endCall()"
                >
                    <Icon name="phone" :size="21" style="transform: rotate(135deg)" />
                    End
                </button>
            </template>
        </div>
    </div>
</template>
