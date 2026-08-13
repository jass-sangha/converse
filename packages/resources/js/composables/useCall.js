import { ref, shallowRef, computed } from 'vue';
import { useChatStore } from '../store';
import { chatableKeyOf } from '../chatable';
import { useCalls } from './useCalls';
import { useToast } from './useToast';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];
const RING_TIMEOUT_MS = 45000;

// phase: idle | outgoing | incoming | connecting | live
const phase = ref('idle');
const conversationId = ref(null);
const peer = ref(null); // { type, id }
const video = ref(false);
const muted = ref(false);
const camOn = ref(false);
const speakerOn = ref(true);
const minimized = ref(false);
const startedAt = ref(null);
const elapsed = ref(0);
const localStream = shallowRef(null);
const remoteStream = shallowRef(null);

let pc = null;
let pendingOfferSdp = null;
let pendingCandidates = [];
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

function createPeerConnection() {
    pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    localStream.value?.getTracks().forEach((track) => pc.addTrack(track, localStream.value));

    pc.ontrack = (event) => {
        if (!remoteStream.value) {
            remoteStream.value = new MediaStream();
        }
        remoteStream.value.addTrack(event.track);
    };

    pc.onicecandidate = (event) => {
        if (event.candidate && conversationId.value) {
            useCalls().signal(conversationId.value, { kind: 'ice', candidate: event.candidate.toJSON() }).catch(() => {});
        }
    };

    pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected' && phase.value !== 'live') {
            phase.value = 'live';
            startedAt.value = Date.now();
            elapsed.value = 0;
            startClock();
        }
    };

    return pc;
}

async function flushPendingCandidates() {
    const queued = pendingCandidates;
    pendingCandidates = [];
    for (const candidate of queued) {
        await pc.addIceCandidate(candidate).catch(() => {});
    }
}

function cleanup() {
    clearTimeout(ringTimer);
    ringTimer = null;
    stopClock();

    localStream.value?.getTracks().forEach((t) => t.stop());
    localStream.value = null;
    remoteStream.value = null;

    pc?.close();
    pc = null;
    pendingOfferSdp = null;
    pendingCandidates = [];

    conversationId.value = null;
    peer.value = null;
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
        if (phase.value !== 'idle' || conversation.type !== 'private') {
            return;
        }

        if (mediaUnavailable()) {
            useToast().show('Calling isn’t supported in this browser.');
            return;
        }

        const other = otherParticipantOf(conversation);
        if (!other) {
            return;
        }

        conversationId.value = conversation.id;
        peer.value = other;
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

        createPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await useCalls().signal(conversationId.value, { kind: 'offer', sdp: offer.sdp, video: withVideo });

        ringTimer = setTimeout(() => {
            if (phase.value === 'outgoing') {
                useToast().show('No answer.');
                endCall({ silent: true });
            }
        }, RING_TIMEOUT_MS);
    }

    async function acceptCall() {
        if (phase.value !== 'incoming' || !pendingOfferSdp) {
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
        phase.value = 'connecting';
        createPeerConnection();
        await pc.setRemoteDescription({ type: 'offer', sdp: pendingOfferSdp });
        await flushPendingCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await useCalls().signal(conversationId.value, { kind: 'answer', sdp: answer.sdp });
    }

    function declineCall() {
        if (phase.value !== 'incoming') {
            return;
        }
        useCalls().signal(conversationId.value, { kind: 'decline' }).catch(() => {});
        cleanup();
        phase.value = 'idle';
    }

    function endCall({ silent = false } = {}) {
        const wasLive = phase.value === 'live';
        const wasOutgoing = phase.value === 'outgoing' || phase.value === 'connecting';
        const finalElapsed = elapsed.value;

        if (conversationId.value && phase.value !== 'idle' && !silent) {
            useCalls().signal(conversationId.value, { kind: 'hangup' }).catch(() => {});
        }

        cleanup();
        phase.value = 'idle';

        if (wasLive) {
            useToast().show(`Call ended · ${formatCallClock(finalElapsed)}`);
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
        if (conversationId.value && conversationId.value !== incomingConversationId && payload.kind !== 'offer') {
            return;
        }

        switch (payload.kind) {
            case 'offer': {
                if (phase.value !== 'idle') {
                    useCalls().signal(incomingConversationId, { kind: 'busy' }).catch(() => {});
                    return;
                }

                conversationId.value = incomingConversationId;
                peer.value = { type: from_type, id: from_id };
                video.value = !!payload.video;
                pendingOfferSdp = payload.sdp;
                phase.value = 'incoming';
                break;
            }
            case 'answer': {
                if (phase.value === 'outgoing' && pc) {
                    clearTimeout(ringTimer);
                    ringTimer = null;
                    phase.value = 'connecting';
                    pc.setRemoteDescription({ type: 'answer', sdp: payload.sdp }).then(flushPendingCandidates);
                }
                break;
            }
            case 'ice': {
                if (pc?.remoteDescription) {
                    pc.addIceCandidate(payload.candidate).catch(() => {});
                } else {
                    pendingCandidates.push(payload.candidate);
                }
                break;
            }
            case 'decline':
            case 'busy': {
                if (phase.value === 'outgoing' || phase.value === 'connecting') {
                    useToast().show(payload.kind === 'busy' ? 'Line busy.' : 'Call declined.');
                    endCall({ silent: true });
                }
                break;
            }
            case 'hangup': {
                if (phase.value === 'incoming') {
                    useToast().show('Missed call.');
                    endCall({ silent: true });
                } else if (phase.value !== 'idle') {
                    endCall({ silent: true });
                }
                break;
            }
        }
    }

    return {
        phase,
        conversationId,
        peer,
        video,
        muted,
        camOn,
        speakerOn,
        minimized,
        elapsed,
        localStream,
        remoteStream,
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
