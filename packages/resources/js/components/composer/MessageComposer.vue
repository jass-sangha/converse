<script setup>
import { nextTick, ref, watch } from 'vue';
import ReplyPreview from '../chat/ReplyPreview.vue';
import EmojiPicker from './EmojiPicker.vue';
import AttachmentPicker from './AttachmentPicker.vue';
import VoiceRecorder from './VoiceRecorder.vue';
import { useMessages } from '../../composables/useMessages';
import { useTyping } from '../../composables/useTyping';
import { useApi } from '../../composables/useApi';

const props = defineProps({
    conversationId: { type: Number, required: true },
    replyTo: { type: Object, default: null },
    editing: { type: Object, default: null },
});

const emit = defineEmits(['sent', 'dismiss-reply', 'dismiss-edit']);

const { send, update } = useMessages();
const { notifyTyping, stopTyping } = useTyping();
const api = useApi();

const body = ref('');
const showEmoji = ref(false);
const linkPreview = ref(null);
const recording = ref(false);
const inputEl = ref(null);
let linkDebounce = null;

watch(body, (value) => {
    if (value.trim()) {
        notifyTyping(props.conversationId);
    }

    clearTimeout(linkDebounce);
    linkDebounce = setTimeout(() => detectLink(value), 500);
});

watch(() => props.editing, (message) => {
    if (message) {
        body.value = message.body ?? '';
        focusInput();
    }
});

watch(() => props.replyTo, (replyTo) => {
    if (replyTo) {
        focusInput();
    }
});

function focusInput() {
    nextTick(() => inputEl.value?.focus());
}

async function detectLink(value) {
    const match = value.match(/https?:\/\/\S+/);
    if (!match) {
        linkPreview.value = null;
        return;
    }

    try {
        const { data } = await api.post('/link-preview', { url: match[0] });
        linkPreview.value = data.data;
    } catch {
        linkPreview.value = null;
    }
}

function onEmojiPick(emoji) {
    body.value += emoji;
    showEmoji.value = false;
    focusInput();
}

async function onAttachmentUploaded({ attachment, type }) {
    await send(props.conversationId, {
        type,
        attachment_ids: [attachment.id],
        reply_to_message_id: props.replyTo?.id ?? null,
    });
    emit('sent');
    emit('dismiss-reply');
}

async function onVoiceRecorded({ attachment, durationSeconds }) {
    await send(props.conversationId, {
        type: 'voice',
        attachment_ids: [attachment.id],
        metadata: { duration: durationSeconds },
    });
    emit('sent');
}

function cancelEdit() {
    body.value = '';
    emit('dismiss-edit');
}

function onInputEscape() {
    if (props.editing) {
        cancelEdit();
    } else if (props.replyTo) {
        emit('dismiss-reply');
    }
}

async function submit() {
    const trimmed = body.value.trim();
    if (!trimmed) return;

    if (props.editing) {
        await update(props.editing.id, props.editing.conversation_id, trimmed);
        body.value = '';
        emit('dismiss-edit');
        return;
    }

    stopTyping(props.conversationId);

    const metadata = linkPreview.value ? { link_preview: linkPreview.value } : null;

    await send(props.conversationId, {
        type: 'text',
        body: trimmed,
        metadata,
        reply_to_message_id: props.replyTo?.id ?? null,
    });

    body.value = '';
    linkPreview.value = null;
    emit('sent');
    emit('dismiss-reply');
}
</script>

<template>
    <div class="cv-composer border-t border-converse-border bg-converse-surface p-2">
        <ReplyPreview
            v-if="replyTo"
            :reply-to="replyTo"
            :dismissible="true"
            class="mb-2"
            @dismiss="emit('dismiss-reply')"
        />

        <div v-if="editing" class="cv-composer__editing mb-2 flex items-center gap-2 rounded-cv border-l-4 border-converse-accent bg-converse-surfaceHover px-3 py-1.5">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="shrink-0 text-converse-accent"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/></svg>
            <span class="flex-1 truncate text-xs text-converse-textMuted">Editing message</span>
            <button type="button" class="text-converse-textMuted hover:text-converse-text" @click="cancelEdit">✕</button>
        </div>

        <div v-if="linkPreview" class="cv-composer__link-preview mb-2 rounded-cv border border-converse-border p-2 text-xs text-converse-textMuted">
            Link preview: {{ linkPreview.title || linkPreview.url }}
        </div>

        <form class="cv-composer__form flex items-center gap-2" @submit.prevent="submit">
            <template v-if="!recording">
                <AttachmentPicker @uploaded="onAttachmentUploaded" />

                <div class="cv-composer__emoji-wrap relative">
                    <button type="button" class="text-xl text-converse-textMuted hover:text-converse-accent" @click="showEmoji = !showEmoji">😊</button>
                    <div v-if="showEmoji" class="absolute bottom-10 left-0 z-10">
                        <EmojiPicker @pick="onEmojiPick" />
                    </div>
                </div>

                <input
                    ref="inputEl"
                    v-model="body"
                    type="text"
                    :placeholder="editing ? 'Edit message' : 'Type a message'"
                    class="cv-composer__input flex-1 rounded-full bg-converse-surfaceHover px-4 py-2 text-sm text-converse-text focus:outline-none"
                    @keydown.escape="onInputEscape"
                >
            </template>

            <VoiceRecorder
                v-if="!body.trim() && !editing"
                @recorded="onVoiceRecorded"
                @recording-change="recording = $event"
            />
            <button v-else type="submit" class="cv-composer__send rounded-full bg-converse-accent px-4 py-2 text-sm font-medium text-converse-accentContrast">
                {{ editing ? 'Save' : 'Send' }}
            </button>
        </form>
    </div>
</template>
