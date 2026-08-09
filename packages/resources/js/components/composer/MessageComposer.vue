<script setup>
import { computed, nextTick, ref, watch } from 'vue';
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
const stagedAttachments = ref([]);
let linkDebounce = null;

const hasStaged = computed(() => stagedAttachments.value.length > 0);

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

function onAttachmentUploaded(uploaded) {
    stagedAttachments.value = [...stagedAttachments.value, ...uploaded];
    focusInput();
}

function removeStaged(attachment) {
    stagedAttachments.value = stagedAttachments.value.filter((item) => item.attachment.id !== attachment.id);
}

function clearStaged() {
    stagedAttachments.value = [];
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
    } else if (hasStaged.value) {
        clearStaged();
    } else if (props.replyTo) {
        emit('dismiss-reply');
    }
}

async function sendStagedAttachments() {
    const trimmed = body.value.trim();

    // Attachments of different message types (image/video/document/audio) can't share a
    // single message — group same-type ones together so e.g. 4 photos picked at once
    // collapse into one message, while a photo + a document still send as two.
    const groups = new Map();
    for (const item of stagedAttachments.value) {
        if (!groups.has(item.type)) groups.set(item.type, []);
        groups.get(item.type).push(item.attachment.id);
    }

    let captionUsed = false;
    for (const [type, attachmentIds] of groups) {
        await send(props.conversationId, {
            type,
            attachment_ids: attachmentIds,
            body: !captionUsed && trimmed ? trimmed : null,
            reply_to_message_id: !captionUsed ? (props.replyTo?.id ?? null) : null,
        });
        captionUsed = true;
    }

    stagedAttachments.value = [];
    body.value = '';
    emit('sent');
    emit('dismiss-reply');
}

async function submit() {
    if (props.editing) {
        const trimmed = body.value.trim();
        if (!trimmed) return;

        await update(props.editing.id, props.editing.conversation_id, trimmed);
        body.value = '';
        emit('dismiss-edit');
        return;
    }

    if (hasStaged.value) {
        await sendStagedAttachments();
        return;
    }

    const trimmed = body.value.trim();
    if (!trimmed) return;

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

        <div v-if="hasStaged" class="cv-composer__staged mb-2 flex items-center gap-2 overflow-x-auto rounded-cv border border-converse-border bg-converse-surfaceHover p-2">
            <div v-for="item in stagedAttachments" :key="item.attachment.id" class="relative shrink-0">
                <img
                    v-if="item.type === 'image'"
                    :src="item.attachment.thumbnail_url || item.attachment.url"
                    class="h-16 w-16 rounded object-cover"
                >
                <video v-else-if="item.type === 'video'" :src="item.attachment.url" class="h-16 w-16 rounded object-cover" muted />
                <div v-else class="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded bg-converse-surface p-1 text-center">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="text-converse-textMuted"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5Z"/></svg>
                    <span class="w-full truncate text-[10px] text-converse-textMuted">{{ item.attachment.original_filename }}</span>
                </div>
                <button
                    type="button"
                    title="Remove"
                    class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-converse-overlay/70 text-white"
                    @click="removeStaged(item.attachment)"
                >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M18.3 5.71 12 12.01l6.3 6.3-1.41 1.41L10.59 13.4l-6.3 6.3-1.41-1.42 6.3-6.3-6.3-6.29L4.3 4.28l6.29 6.3 6.3-6.3Z"/></svg>
                </button>
            </div>
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
                    :placeholder="hasStaged ? 'Add a caption' : editing ? 'Edit message' : 'Type a message'"
                    class="cv-composer__input flex-1 rounded-full bg-converse-surfaceHover px-4 py-2 text-sm text-converse-text focus:outline-none"
                    @keydown.escape="onInputEscape"
                >
            </template>

            <VoiceRecorder
                v-if="!body.trim() && !editing && !hasStaged"
                @recorded="onVoiceRecorded"
                @recording-change="recording = $event"
            />
            <button v-else type="submit" class="cv-composer__send rounded-full bg-converse-accent px-4 py-2 text-sm font-medium text-converse-accentContrast">
                {{ editing ? 'Save' : 'Send' }}
            </button>
        </form>
    </div>
</template>
