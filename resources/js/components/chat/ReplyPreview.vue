<script setup>
import { computed } from 'vue';
import { useUsers } from '../../composables/useUsers';

const props = defineProps({
    replyTo: { type: Object, required: true },
    dismissible: { type: Boolean, default: false },
    isOwn: { type: Boolean, default: false },
});

defineEmits(['dismiss']);

const { get } = useUsers();

const whoName = computed(() => get({ type: props.replyTo.chatable_type, id: props.replyTo.chatable_id }).name);

const MEDIA_THUMBNAIL_TYPES = new Set(['image', 'video', 'gif', 'sticker']);

const firstAttachment = computed(() => props.replyTo.attachments?.[0] ?? null);

const thumbnailUrl = computed(() => {
    if (!MEDIA_THUMBNAIL_TYPES.has(props.replyTo.type)) return null;
    const attachment = firstAttachment.value;
    return attachment ? attachment.thumbnail_url || attachment.url : null;
});

const isVideoThumbnail = computed(() => props.replyTo.type === 'video');

const typeLabel = computed(() => {
    switch (props.replyTo.type) {
        case 'image':
            return 'Photo';
        case 'video':
            return 'Video';
        case 'gif':
            return 'GIF';
        case 'sticker':
            return 'Sticker';
        case 'voice':
            return 'Voice message';
        case 'audio':
            return 'Audio';
        case 'document':
            return firstAttachment.value?.original_filename ?? 'Document';
        case 'poll':
            return props.replyTo.metadata?.question ?? 'Poll';
        case 'event':
            return props.replyTo.metadata?.title ?? 'Event';
        case 'location':
            return props.replyTo.metadata?.name ?? 'Location';
        case 'contact':
            return props.replyTo.metadata?.name ?? 'Contact';
        default:
            return '';
    }
});

const snippet = computed(() => {
    if (props.replyTo.deleted_for_everyone) return 'This message was deleted';
    if (props.replyTo.type === 'text') return props.replyTo.body || '';
    // Media types show their own caption when there is one, otherwise a type label.
    return props.replyTo.body?.trim() || typeLabel.value;
});
</script>

<template>
    <div
        v-if="dismissible"
        class="chat-reply-preview flex items-center gap-3 rounded-[18px] bg-riwaaq-surface px-4 py-2.5 shadow-sm"
    >
        <span class="shrink-0 self-stretch rounded-full bg-riwaaq-accent" style="width: 3px" />
        <img
            v-if="thumbnailUrl"
            :src="thumbnailUrl"
            alt=""
            class="h-9 w-9 shrink-0 rounded-lg object-cover"
        >
        <div class="min-w-0 flex-1">
            <p class="text-[11.5px] font-bold text-riwaaq-accentText">Replying to {{ whoName }}</p>
            <p class="truncate text-[12.5px] text-riwaaq-textMuted">{{ snippet }}</p>
        </div>
        <button
            type="button"
            title="Cancel reply"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover"
            @click="$emit('dismiss')"
        >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
    </div>

    <div
        v-else
        class="chat-reply-preview flex items-center gap-2 rounded-[14px] px-[11px] py-[7px]"
        :class="isOwn ? 'bg-[rgba(140,73,26,.1)]' : 'bg-riwaaq-surfaceHover'"
    >
        <div class="relative min-w-0 flex-1">
            <p class="text-[11.5px] font-bold text-riwaaq-accentText">{{ whoName }}</p>
            <p class="mt-px truncate text-[12.5px] text-riwaaq-textMuted">{{ snippet }}</p>
        </div>
        <span v-if="thumbnailUrl" class="relative shrink-0">
            <img :src="thumbnailUrl" alt="" class="h-9 w-9 rounded-lg object-cover">
            <svg
                v-if="isVideoThumbnail"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="white"
                class="absolute inset-0 m-auto drop-shadow"
            >
                <path d="M8 5.5l11 6.5-11 6.5Z" />
            </svg>
        </span>
    </div>
</template>
