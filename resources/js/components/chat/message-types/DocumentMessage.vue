<script setup>
import { ref } from "vue";
import MediaViewerModal from "../../shared/MediaViewerModal.vue";
import AlbumGrid from "./AlbumGrid.vue";
import Icon from "../../shared/Icon.vue";

const props = defineProps({
    message: { type: Object, required: true },
    isOwn: { type: Boolean, default: false },
});

const viewerIndex = ref(null);

const viewerItems = props.message.attachments.map((attachment) => ({
    url: attachment.url,
    kind: "document",
    mime_type: attachment.mime_type,
    original_filename: attachment.original_filename,
}));

function formatSize(bytes) {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}
</script>

<template>
    <AlbumGrid
        v-if="message.attachments.length > 1"
        :attachments="message.attachments"
        kind="document"
    />
    <template v-else>
        <button
            v-for="(attachment, index) in message.attachments"
            :key="attachment.id"
            type="button"
            title="View"
            class="chat-document-message flex w-full items-center gap-[11px] rounded-2xl py-[9px] px-[11px] text-left"
            :class="isOwn ? 'bg-[rgba(140,73,26,.09)]' : 'bg-riwaaq-surfaceHover'"
            @click="viewerIndex = index"
        >
            <span
                class="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-riwaaq-surface"
                :class="isOwn ? 'text-riwaaq-accent' : 'text-riwaaq-sage'"
            >
                <Icon name="document" :size="18" />
            </span>
            <span class="chat-document-message__meta min-w-0 flex-1">
                <span class="block truncate text-[13.5px] font-semibold">{{ attachment.original_filename }}</span>
                <span class="mt-px block text-[11.5px] text-riwaaq-textDim">{{ formatSize(attachment.size_bytes) }}</span>
            </span>
            <a
                :href="attachment.url"
                :download="attachment.original_filename"
                title="Download"
                class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surface"
                :class="isOwn ? 'hover:text-riwaaq-accent' : 'hover:text-riwaaq-sage'"
                @click.stop
            >
                <Icon name="download" :size="15" />
            </a>
        </button>
    </template>

    <MediaViewerModal
        v-if="viewerIndex !== null"
        :items="viewerItems"
        :index="viewerIndex"
        @close="viewerIndex = null"
    />
</template>
