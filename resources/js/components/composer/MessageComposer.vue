<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import ReplyPreview from '../chat/ReplyPreview.vue';
import EmojiPicker from './EmojiPicker.vue';
import AttachmentPicker from './AttachmentPicker.vue';
import VoiceRecorder from './VoiceRecorder.vue';
import PollComposerModal from './PollComposerModal.vue';
import EventComposerModal from './EventComposerModal.vue';
import Icon from '../shared/Icon.vue';
import { useMessages } from '../../composables/useMessages';
import { useTyping } from '../../composables/useTyping';
import { useApi } from '../../composables/useApi';
import { useToast } from '../../composables/useToast';
import { useExclusiveDropdown } from '../../composables/useExclusiveDropdown';

const props = defineProps({
    conversationId: { type: Number, required: true },
    replyTo: { type: Object, default: null },
    editing: { type: Object, default: null },
});

const emit = defineEmits(['sent', 'dismiss-reply', 'dismiss-edit']);

const { send, update } = useMessages();
const { notifyTyping, stopTyping } = useTyping();
const api = useApi();
const { show: showToast } = useToast();

const body = ref('');
const showEmoji = ref(false);
const emojiWrap = ref(null);
const linkPreview = ref(null);
const recording = ref(false);
const inputEl = ref(null);
const stagedAttachments = ref([]);
const showPollModal = ref(false);
const showEventModal = ref(false);
let linkDebounce = null;

const { opened: dropdownOpened, closed: dropdownClosed } = useExclusiveDropdown();

function closeEmoji() {
    showEmoji.value = false;
}

function toggleEmoji() {
    showEmoji.value = !showEmoji.value;
}

function onEmojiDocumentClick(event) {
    if (emojiWrap.value && !emojiWrap.value.contains(event.target)) {
        closeEmoji();
    }
}

watch(showEmoji, (open) => {
    if (open) {
        document.addEventListener('click', onEmojiDocumentClick);
        dropdownOpened(closeEmoji);
    } else {
        document.removeEventListener('click', onEmojiDocumentClick);
        dropdownClosed(closeEmoji);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onEmojiDocumentClick);
    dropdownClosed(closeEmoji);
});

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

function isDuplicate(item) {
    return stagedAttachments.value.some(
        (staged) =>
            staged.attachment.original_filename === item.attachment.original_filename &&
            staged.attachment.size_bytes === item.attachment.size_bytes,
    );
}

function onAttachmentUploaded(uploaded) {
    const fresh = uploaded.filter((item) => !isDuplicate(item));
    if (fresh.length < uploaded.length) {
        showToast("Skipped a file already added to this message.");
    }
    stagedAttachments.value = [...stagedAttachments.value, ...fresh];
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

async function onCreatePoll({ question, options, multiple }) {
    await send(props.conversationId, {
        type: 'poll',
        metadata: { question, options, multiple },
    });
    showPollModal.value = false;
    emit('sent');
}

async function onCreateEvent({ title: eventTitle, starts_at, location, location_lat, location_lng, description }) {
    await send(props.conversationId, {
        type: 'event',
        metadata: { title: eventTitle, starts_at, location, location_lat, location_lng, description },
    });
    showEventModal.value = false;
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
    <div class="chat-composer relative shrink-0 bg-transparent px-3 pb-3 pt-2 sm:px-12">
      <div class="mx-auto max-w-7xl">
        <ReplyPreview
            v-if="replyTo"
            :reply-to="replyTo"
            :dismissible="true"
            class="mb-2"
            @dismiss="emit('dismiss-reply')"
        />

        <div v-if="editing" class="chat-composer__editing mb-2 flex items-center gap-2 rounded-chat border-l-4 border-riwaaq-accent bg-riwaaq-surfaceHover px-3 py-1.5">
            <Icon name="edit" :size="16" class="shrink-0 text-riwaaq-accent" />
            <span class="flex-1 truncate text-xs text-riwaaq-textMuted">Editing message</span>
            <button type="button" class="text-riwaaq-textMuted hover:text-riwaaq-text" @click="cancelEdit">✕</button>
        </div>

        <div v-if="linkPreview" class="chat-composer__link-preview mb-2 flex items-center gap-2 overflow-hidden rounded-chat border border-riwaaq-border p-2 text-xs text-riwaaq-textMuted">
            <img v-if="linkPreview.image" :src="linkPreview.image" alt="" class="h-16 w-16 shrink-0 rounded object-cover">
            <div class="min-w-0 flex-1">
                <p v-if="linkPreview.site_name" class="truncate text-[10px] font-bold uppercase tracking-wide text-riwaaq-textDim">{{ linkPreview.site_name }}</p>
                <p class="truncate font-medium text-riwaaq-text">{{ linkPreview.title || linkPreview.url }}</p>
                <p v-if="linkPreview.description" class="truncate">{{ linkPreview.description }}</p>
                <!-- Only shown alongside a real title — otherwise the line above already falls back to the raw url. -->
                <p v-if="linkPreview.title" class="truncate text-riwaaq-textDim">{{ linkPreview.url }}</p>
            </div>
        </div>

        <div v-if="hasStaged" class="chat-composer__staged mb-2 flex items-center gap-2 overflow-x-auto rounded-chat border border-riwaaq-border bg-riwaaq-surfaceHover p-2">
            <div v-for="item in stagedAttachments" :key="item.attachment.id" class="relative shrink-0">
                <img
                    v-if="item.type === 'image'"
                    :src="item.attachment.thumbnail_url || item.attachment.url"
                    class="h-16 w-16 rounded object-cover"
                >
                <video v-else-if="item.type === 'video'" :src="item.attachment.url" class="h-16 w-16 rounded object-cover" muted />
                <div v-else class="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded bg-riwaaq-surface p-1 text-center">
                    <Icon name="file" :size="18" class="text-riwaaq-textMuted" />
                    <span class="w-full truncate text-[10px] text-riwaaq-textMuted">{{ item.attachment.original_filename }}</span>
                </div>
                <button
                    type="button"
                    title="Remove"
                    class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-riwaaq-overlay/70 text-white"
                    @click="removeStaged(item.attachment)"
                >
                    <Icon name="close-alt" :size="12" />
                </button>
            </div>
        </div>

        <form class="chat-composer__form flex items-center gap-2" @submit.prevent="submit">
            <template v-if="!recording">
                <AttachmentPicker
                    @uploaded="onAttachmentUploaded"
                    @create-poll="showPollModal = true"
                    @create-event="showEventModal = true"
                />

                <div ref="emojiWrap" class="chat-composer__emoji-wrap relative hidden shrink-0 sm:block">
                    <button type="button" title="Emoji" class="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-riwaaq-surface text-riwaaq-textMuted shadow-chat hover:text-riwaaq-accent" @click="toggleEmoji">
                        <Icon name="smile-outline" :size="20" />
                    </button>
                    <div v-if="showEmoji" class="chat-animate-pop-in absolute bottom-14 left-0 z-10">
                        <EmojiPicker @pick="onEmojiPick" />
                    </div>
                </div>

                <div class="flex h-[52px] min-w-0 flex-1 items-center rounded-full bg-riwaaq-surface px-[22px] shadow-chat">
                    <input
                        ref="inputEl"
                        v-model="body"
                        type="text"
                        :placeholder="hasStaged ? 'Add a caption' : editing ? 'Edit message' : 'Type a message'"
                        class="chat-composer__input w-full min-w-0 bg-transparent text-sm text-riwaaq-text focus:outline-none"
                        @keydown.escape="onInputEscape"
                    >
                </div>
            </template>

            <VoiceRecorder
                v-if="!body.trim() && !editing && !hasStaged"
                @recorded="onVoiceRecorded"
                @recording-change="recording = $event"
            />
            <button v-else type="submit" class="chat-composer__send flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-riwaaq-accent text-sm font-medium text-riwaaq-accentContrast shadow-chat">
                <Icon v-if="!editing" name="send" :size="21" />
                <span v-else>Save</span>
            </button>
        </form>
      </div>

        <PollComposerModal v-if="showPollModal" @close="showPollModal = false" @create="onCreatePoll" />
        <EventComposerModal v-if="showEventModal" @close="showEventModal = false" @create="onCreateEvent" />
    </div>
</template>
