<script setup>
import { computed, ref } from 'vue';
import { useChatStore } from '../../store';
import { chatableKeyOf } from '../../chatable';
import { useMessages } from '../../composables/useMessages';
import { useMessagePins } from '../../composables/useMessagePins';
import TextMessage from './message-types/TextMessage.vue';
import ImageMessage from './message-types/ImageMessage.vue';
import VideoMessage from './message-types/VideoMessage.vue';
import AudioMessage from './message-types/AudioMessage.vue';
import VoiceMessage from './message-types/VoiceMessage.vue';
import DocumentMessage from './message-types/DocumentMessage.vue';
import LocationMessage from './message-types/LocationMessage.vue';
import ContactMessage from './message-types/ContactMessage.vue';
import SystemMessage from './message-types/SystemMessage.vue';
import ReplyPreview from './ReplyPreview.vue';
import ReactionPicker from './ReactionPicker.vue';
import ReactionPills from './ReactionPills.vue';
import ReadReceiptTicks from './ReadReceiptTicks.vue';
import ForwardModal from './ForwardModal.vue';

const TYPE_COMPONENTS = {
    text: TextMessage,
    image: ImageMessage,
    video: VideoMessage,
    audio: AudioMessage,
    voice: VoiceMessage,
    document: DocumentMessage,
    location: LocationMessage,
    contact: ContactMessage,
};

const props = defineProps({
    message: { type: Object, required: true },
});

const emit = defineEmits(['reply', 'edit', 'star-changed']);

const store = useChatStore();
const { react, unreact, star, unstar, deleteForMe, deleteForEveryone } = useMessages();
const { pin, unpin } = useMessagePins();

const pinError = ref('');

const isOwn = computed(() => chatableKeyOf(props.message) === store.currentKey);
const isSystem = computed(() => props.message.type === 'system' || props.message.chatable_id === null);
const bodyComponent = computed(() => TYPE_COMPONENTS[props.message.type] ?? TextMessage);

const showMenu = ref(false);
const showReactionPicker = ref(false);
const showForward = ref(false);

function toggleMenu() {
    showMenu.value = !showMenu.value;
}

async function onPickReaction(emoji) {
    showReactionPicker.value = false;
    const mine = props.message.reactions?.find((r) => r.self);
    if (mine && mine.emoji === emoji) {
        await unreact(props.message.id, props.message.conversation_id);
    } else {
        await react(props.message.id, props.message.conversation_id, emoji);
    }
}

async function onTogglePill(emoji) {
    const mine = props.message.reactions?.find((r) => r.self);
    if (mine && mine.emoji === emoji) {
        await unreact(props.message.id, props.message.conversation_id);
    } else {
        await react(props.message.id, props.message.conversation_id, emoji);
    }
}

async function onStarToggle() {
    showMenu.value = false;
    if (props.message.is_starred_by_me) {
        await unstar(props.message.id);
    } else {
        await star(props.message.id);
    }
    props.message.is_starred_by_me = !props.message.is_starred_by_me;
    emit('star-changed', props.message);
}

async function onPinToggle() {
    showMenu.value = false;
    pinError.value = '';
    try {
        if (props.message.is_pinned) {
            await unpin(props.message);
        } else {
            await pin(props.message);
        }
        props.message.is_pinned = !props.message.is_pinned;
    } catch (e) {
        pinError.value = e.response?.data?.message ?? 'Could not update pin.';
    }
}

async function onDeleteForMe() {
    showMenu.value = false;
    await deleteForMe(props.message.id, props.message.conversation_id);
}

async function onDeleteForEveryone() {
    showMenu.value = false;
    await deleteForEveryone(props.message.id, props.message.conversation_id);
}
</script>

<template>
    <SystemMessage v-if="isSystem" :message="message" />

    <div v-else class="cv-message-bubble group flex" :class="isOwn ? 'justify-end' : 'justify-start'">
        <div
            class="cv-message-bubble__content relative max-w-[70%] rounded-cv px-3 py-1.5 shadow-sm"
            :class="isOwn ? 'rounded-tr-sm bg-converse-bubbleOut' : 'rounded-tl-sm bg-converse-bubbleIn'"
        >
            <span v-if="message.is_pinned" class="cv-message-bubble__pin-indicator absolute -top-2 -left-2 text-xs" title="Pinned">📌</span>

            <ReplyPreview v-if="message.reply_to" :reply-to="message.reply_to" class="mb-1" />

            <p v-if="message.deleted_for_everyone" class="text-sm italic text-converse-textMuted">This message was deleted</p>
            <component :is="bodyComponent" v-else :message="message" />

            <div class="cv-message-bubble__meta mt-0.5 flex items-center justify-end gap-1 text-[10px] text-converse-textMuted">
                <span>{{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
                <span v-if="message.edited_at">(edited)</span>
                <ReadReceiptTicks v-if="isOwn" :status="message.status" />
            </div>

            <ReactionPills :reactions="message.reactions ?? []" @toggle="onTogglePill" />

            <div
                v-if="!message.deleted_for_everyone"
                class="cv-message-bubble__actions absolute -top-3 right-1 hidden gap-1 group-hover:flex"
            >
                <button type="button" class="rounded-full bg-converse-surface px-1.5 text-xs shadow" @click="showReactionPicker = !showReactionPicker">😊</button>
                <button type="button" class="rounded-full bg-converse-surface px-1.5 text-xs shadow" @click="emit('reply', message)">↩</button>
                <button type="button" class="rounded-full bg-converse-surface px-1.5 text-xs shadow" @click="toggleMenu">⋮</button>
            </div>

            <div v-if="showReactionPicker" class="cv-message-bubble__reaction-picker absolute -top-12 right-1 z-10">
                <ReactionPicker @pick="onPickReaction" />
            </div>

            <div v-if="showMenu" class="cv-message-bubble__menu absolute right-1 top-6 z-10 w-40 rounded border border-converse-border bg-converse-surface text-sm shadow-lg">
                <button type="button" class="block w-full px-3 py-2 text-left hover:bg-converse-surfaceHover" @click="showForward = true; showMenu = false">Forward</button>
                <button type="button" class="block w-full px-3 py-2 text-left hover:bg-converse-surfaceHover" @click="onStarToggle">
                    {{ message.is_starred_by_me ? 'Unstar' : 'Star' }}
                </button>
                <button type="button" class="block w-full px-3 py-2 text-left hover:bg-converse-surfaceHover" @click="onPinToggle">
                    {{ message.is_pinned ? 'Unpin' : 'Pin' }}
                </button>
                <button v-if="isOwn && message.type === 'text'" type="button" class="block w-full px-3 py-2 text-left hover:bg-converse-surfaceHover" @click="emit('edit', message); showMenu = false">Edit</button>
                <button type="button" class="block w-full px-3 py-2 text-left text-converse-danger hover:bg-converse-surfaceHover" @click="onDeleteForMe">Delete for me</button>
                <button v-if="isOwn" type="button" class="block w-full px-3 py-2 text-left text-converse-danger hover:bg-converse-surfaceHover" @click="onDeleteForEveryone">Delete for everyone</button>
            </div>

            <p v-if="pinError" class="cv-message-bubble__pin-error mt-1 text-xs text-converse-danger">{{ pinError }}</p>
        </div>

        <ForwardModal v-if="showForward" :message-id="message.id" @close="showForward = false" />
    </div>
</template>
