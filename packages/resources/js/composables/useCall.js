import { ref, shallowRef, computed } from 'vue';
import { useChatStore } from '../store';
import { chatableKey, chatableKeyOf } from '../chatable';
import { useCalls } from './useCalls';
import { useToast } from './useToast';
import { useMessages } from './useMessages';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];
const RING_TIMEOUT_MS = 45000;

// phase: idle | outgoing | incoming | connecting | live
const phase = ref('idle');
const conversationId = ref(null);
const isGroup = ref(false);
const announcer = ref(null); // { type, id } — who we're ringing, or who's ringing us
const peers = ref([]); // [{ key, type, id, stream }] — one entry per connected/connecting mesh peer
const video = ref(false);
const muted = ref(false);
const camOn = ref(false);
const speakerOn = ref(true);
const minimized = ref(false);
const startedAt = ref(null);
const elapsed = ref(0);
const localStream = shallowRef(null);

// Not reactive on purpose — RTCPeerConnection instances and their pending-candidate queues are
// mutable engine state, not view state. `peers` above is the reactive projection UI components
// actually read from.
const connections = new Map();

let ringTimer = null;
let clockTimer = null;

export function formatCallClock(totalSeconds) {
    const s = Math.max(0, Math.round(totalSeconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function otherParticipantOf(conversation) {
    const store = useChatStore();
    const other = (conversation.participants ?? []).find((p) => chatableKeyOf(p) !== store.currentKey);
    return other ? { type: other.chatable_type, id: other.chatable_id } : null;
}

function mediaUnavailable() {
    return !navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === 'undefined';
}

function startClock() {
    stopClock();
    clockTimer = setInterval(() => {
        if (startedAt.value) {
            elapsed.value = Math.floor((Date.now() - startedAt.value) / 1000);
        }
    }, 1000);
}

function stopClock() {
    clearInterval(clockTimer);
    clockTimer = null;
}

function syncPeersRef() {
    peers.value = Array.from(connections.values()).map((entry) => ({
        key: chatableKey(entry.type, entry.id),
        type: entry.type,
        id: entry.id,
        stream: entry.stream,
    }));
}

function markLive() {
    clearTimeout(ringTimer);
    ringTimer = null;
    if (phase.value !== 'live') {
        phase.value = 'live';
        startedAt.value = startedAt.value ?? Date.now();
        elapsed.value = 0;
        startClock();
    }
}

// A mesh peer connection is always dedicated to exactly one other participant — a group call
// with N people has each client holding N-1 of these, one per remote participant, rather than
// the single shared connection a 1:1 call used to get away with.
function createPeerConnectionFor(type, id) {
    const key = chatableKey(type, id);
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    localStream.value?.getTracks().forEach((track) => pc.addTrack(track, localStream.value));

    pc.ontrack = (event) => {
        const entry = connections.get(key);
        if (!entry) return;
        // The stream object is created once, up front, and mutated in place from here on — a UI
        // <video> element only has its `srcObject` assigned when it first mounts (see the `:ref`
        // callback pattern in CallOverlay.vue), so swapping in a *new* MediaStream object later
        // would silently stop showing anything once tracks start arriving.
        entry.stream.addTrack(event.track);
    };

    pc.onicecandidate = (event) => {
        if (event.candidate && conversationId.value) {
            useCalls().signal(conversationId.value, { kind: 'ice', candidate: event.candidate.toJSON() }, { type, id }).catch(() => {});
        }
    };

    pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
            markLive();
        } else if (['failed', 'closed'].includes(pc.connectionState)) {
            removePeer(key);
        }
    };

    connections.set(key, { pc, type, id, stream: new MediaStream(), pendingCandidates: [] });
    syncPeersRef();
    return pc;
}

function removePeer(key) {
    const entry = connections.get(key);
    if (!entry) return;
    entry.pc.close();
    connections.delete(key);
    syncPeersRef();
}

async function flushPendingCandidates(key) {
    const entry = connections.get(key);
    if (!entry) return;
    const queued = entry.pendingCandidates;
    entry.pendingCandidates = [];
    for (const candidate of queued) {
        await entry.pc.addIceCandidate(candidate).catch(() => {});
    }
}

// Offers only ever flow from an already-connected participant toward a newly-announced one —
// the joiner itself never initiates an offer, only answers ones addressed to it. That one-way
// rule is what keeps a full mesh glare-free without any extra negotiation protocol.
async function offerTo(type, id) {
    const pc = createPeerConnectionFor(type, id);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await useCalls().signal(conversationId.value, { kind: 'offer', sdp: offer.sdp, video: video.value }, { type, id }).catch(() => {});
}

async function answerTo(type, id, sdp) {
    const key = chatableKey(type, id);
    if (connections.has(key)) return;

    const pc = createPeerConnectionFor(type, id);
    await pc.setRemoteDescription({ type: 'offer', sdp });
    await flushPendingCandidates(key);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await useCalls().signal(conversationId.value, { kind: 'answer', sdp: answer.sdp }, { type, id }).catch(() => {});
}

function cleanup() {
    clearTimeout(ringTimer);
    ringTimer = null;
    stopClock();

    localStream.value?.getTracks().forEach((t) => t.stop());
    localStream.value = null;

    connections.forEach((entry) => entry.pc.close());
    connections.clear();
    peers.value = [];

    conversationId.value = null;
    isGroup.value = false;
    announcer.value = null;
    video.value = false;
    muted.value = false;
    camOn.value = false;
    speakerOn.value = true;
    minimized.value = false;
    startedAt.value = null;
    elapsed.value = 0;
}

export function useCall() {
    async function startCall(conversation, { video: withVideo = false } = {}) {
        if (phase.value !== 'idle') {
            return;
        }

        if (mediaUnavailable()) {
            useToast().show('Calling isn’t supported in this browser.');
            return;
        }

        conversationId.value = conversation.id;
        isGroup.value = conversation.type === 'group';
        announcer.value = isGroup.value ? null : otherParticipantOf(conversation);
        video.value = withVideo;
        camOn.value = withVideo;
        phase.value = 'outgoing';

        try {
            localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true, video: withVideo });
        } catch {
            useToast().show('Could not access microphone/camera.');
            cleanup();
            phase.value = 'idle';
            return;
        }

        await useCalls().signal(conversationId.value, { kind: 'join', video: withVideo }).catch(() => {});

        if (isGroup.value) {
            // A group call is an open room, not a ring-one-person-and-wait affair — it's "live"
            // (from this caller's perspective) the moment it's announced, even with nobody else
            // in it yet, and stays open rather than auto-cancelling after a silent ring window.
            markLive();
        } else {
            ringTimer = setTimeout(() => {
                if (phase.value === 'outgoing') {
                    useToast().show('No answer.');
                    endCall({ silent: true });
                }
            }, RING_TIMEOUT_MS);
        }
    }

    async function acceptCall() {
        if (phase.value !== 'incoming') {
            return;
        }

        try {
            localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true, video: video.value });
        } catch {
            useToast().show('Could not access microphone/camera.');
            declineCall();
            return;
        }

        camOn.value = video.value;
        markLive();
        await useCalls().signal(conversationId.value, { kind: 'join', video: video.value }).catch(() => {});
    }

    function declineCall() {
        if (phase.value !== 'incoming') {
            return;
        }
        if (announcer.value) {
            useCalls().signal(conversationId.value, { kind: 'decline' }, announcer.value).catch(() => {});
        }
        cleanup();
        phase.value = 'idle';
    }

    function endCall({ silent = false } = {}) {
        const wasLive = phase.value === 'live';
        const wasOutgoing = phase.value === 'outgoing' || phase.value === 'connecting';
        const finalElapsed = elapsed.value;
        // Captured before cleanup() wipes them — a group call goes 'live' the moment it's
        // announced (see startCall), even with nobody else in it yet, so `peers` (not `wasLive`
        // alone) is what actually tells us whether anyone joined and this is worth logging.
        const finalConversationId = conversationId.value;
        const finalVideo = video.value;
        const finalParticipants = peers.value.map((p) => ({ type: p.type, id: p.id }));

        if (conversationId.value && phase.value !== 'idle' && !silent) {
            useCalls().signal(conversationId.value, { kind: 'leave' }).catch(() => {});
        }

        cleanup();
        phase.value = 'idle';

        if (wasLive) {
            useToast().show(`Call ended · ${formatCallClock(finalElapsed)}`);

            if (finalConversationId && finalParticipants.length > 0) {
                useMessages().send(finalConversationId, {
                    type: 'call',
                    metadata: {
                        video: finalVideo,
                        duration_seconds: Math.round(finalElapsed),
                        participants: finalParticipants,
                    },
                }).catch(() => {});
            }
        } else if (wasOutgoing && !silent) {
            useToast().show('Call cancelled.');
        }
    }

    function toggleMute() {
        muted.value = !muted.value;
        localStream.value?.getAudioTracks().forEach((t) => (t.enabled = !muted.value));
    }

    function toggleCam() {
        if (!video.value) return;
        camOn.value = !camOn.value;
        localStream.value?.getVideoTracks().forEach((t) => (t.enabled = camOn.value));
    }

    function toggleSpeaker() {
        speakerOn.value = !speakerOn.value;
    }

    function minimize() {
        minimized.value = true;
    }

    function restore() {
        minimized.value = false;
    }

    function handleSignal({ conversation_id: incomingConversationId, from_type, from_id, payload }) {
        const fromKey = chatableKey(from_type, from_id);

        switch (payload.kind) {
            case 'join': {
                if (phase.value === 'idle') {
                    const store = useChatStore();
                    conversationId.value = incomingConversationId;
                    isGroup.value = store.conversations.find((c) => c.id === incomingConversationId)?.type === 'group';
                    announcer.value = { type: from_type, id: from_id };
                    video.value = !!payload.video;
                    phase.value = 'incoming';
                    return;
                }

                if (conversationId.value !== incomingConversationId) {
                    useCalls().signal(incomingConversationId, { kind: 'busy' }, { type: from_type, id: from_id }).catch(() => {});
                    return;
                }

                // A fellow participant announcing themselves into a call we're already in (or
                // starting/awaiting an answer for) — offer them a dedicated connection, unless
                // it's our own echo or we're already connected to them.
                if (fromKey === useChatStore().currentKey || connections.has(fromKey)) {
                    return;
                }

                markLive();
                offerTo(from_type, from_id);
                return;
            }
            case 'offer': {
                if (conversationId.value !== incomingConversationId) return;
                answerTo(from_type, from_id, payload.sdp);
                return;
            }
            case 'answer': {
                if (conversationId.value !== incomingConversationId) return;
                const entry = connections.get(fromKey);
                if (entry) {
                    entry.pc.setRemoteDescription({ type: 'answer', sdp: payload.sdp }).then(() => flushPendingCandidates(fromKey));
                }
                return;
            }
            case 'ice': {
                if (conversationId.value !== incomingConversationId) return;
                const entry = connections.get(fromKey);
                if (!entry) return;
                if (entry.pc.remoteDescription) {
                    entry.pc.addIceCandidate(payload.candidate).catch(() => {});
                } else {
                    entry.pendingCandidates.push(payload.candidate);
                }
                return;
            }
            case 'decline':
            case 'busy': {
                if (phase.value === 'outgoing' && !isGroup.value) {
                    useToast().show(payload.kind === 'busy' ? 'Line busy.' : 'Call declined.');
                    endCall({ silent: true });
                }
                return;
            }
            case 'leave': {
                if (conversationId.value !== incomingConversationId) return;

                if (connections.has(fromKey)) {
                    removePeer(fromKey);
                    // A 1:1 call has no "room" to keep sitting in once the only other person is
                    // gone — a group call does (others may still be in it), so only auto-end here
                    // for the former; endCall() itself skips logging since peers is now empty.
                    if (!isGroup.value && peers.value.length === 0 && phase.value === 'live') {
                        endCall({ silent: true });
                    }
                    return;
                }

                if (phase.value === 'incoming' && announcer.value && chatableKey(announcer.value.type, announcer.value.id) === fromKey) {
                    useToast().show('Missed call.');
                    cleanup();
                    phase.value = 'idle';
                }
                return;
            }
        }
    }

    return {
        phase,
        conversationId,
        isGroupCall: computed(() => isGroup.value),
        announcer,
        peers,
        video,
        muted,
        camOn,
        speakerOn,
        minimized,
        elapsed,
        localStream,
        isActive: computed(() => phase.value !== 'idle'),
        startCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleCam,
        toggleSpeaker,
        minimize,
        restore,
        handleSignal,
    };
}
