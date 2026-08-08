<script setup>
import { ref, watch } from 'vue';
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
});

const emit = defineEmits(['sent', 'dismiss-reply']);

const { send } = useMessages();
const { notifyTyping, stopTyping } = useTyping();
const api = useApi();

const body = ref('');
const showEmoji = ref(false);
const linkPreview = ref(null);
let linkDebounce = null;

watch(body, (value) => {
    if (value.trim()) {
        notifyTyping(props.conversationId);
    }

    clearTimeout(linkDebounce);
    linkDebounce = setTimeout(() => detectLink(value), 500);
});

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

async function submit() {
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

        <div v-if="linkPreview" class="cv-composer__link-preview mb-2 rounded-cv border border-converse-border p-2 text-xs text-converse-textMuted">
            Link preview: {{ linkPreview.title || linkPreview.url }}
        </div>

        <form class="cv-composer__form flex items-center gap-2" @submit.prevent="submit">
            <div class="cv-composer__emoji-wrap relative">
                <button type="button" class="text-xl text-converse-textMuted hover:text-converse-accent" @click="showEmoji = !showEmoji">😊</button>
                <div v-if="showEmoji" class="absolute bottom-10 left-0 z-10">
                    <EmojiPicker @pick="onEmojiPick" />
                </div>
            </div>

            <AttachmentPicker @uploaded="onAttachmentUploaded" />

            <input
                v-model="body"
                type="text"
                placeholder="Type a message"
                class="cv-composer__input flex-1 rounded-full bg-converse-surfaceHover px-4 py-2 text-sm text-converse-text focus:outline-none"
            >

            <VoiceRecorder v-if="!body.trim()" @recorded="onVoiceRecorded" />
            <button v-else type="submit" class="cv-composer__send rounded-full bg-converse-accent px-4 py-2 text-sm font-medium text-converse-accentContrast">Send</button>
        </form>
    </div>
</template>
