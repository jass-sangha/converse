<script setup>
import { ref } from "vue";
import MediaViewerModal from "../../shared/MediaViewerModal.vue";
import AlbumGrid from "./AlbumGrid.vue";

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
            class="cv-document-message flex w-full items-center gap-[11px] rounded-2xl py-[9px] px-[11px] text-left"
            :class="isOwn ? 'bg-[rgba(140,73,26,.09)]' : 'bg-converse-surfaceHover'"
            @click="viewerIndex = index"
        >
            <span
                class="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-converse-surface"
                :class="isOwn ? 'text-converse-accent' : 'text-converse-sage'"
            >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></svg>
            </span>
            <span class="cv-document-message__meta min-w-0 flex-1">
                <span class="block truncate text-[13.5px] font-semibold">{{ attachment.original_filename }}</span>
                <span class="mt-px block text-[11.5px] text-converse-textDim">{{ formatSize(attachment.size_bytes) }}</span>
            </span>
            <a
                :href="attachment.url"
                :download="attachment.original_filename"
                title="Download"
                class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surface"
                :class="isOwn ? 'hover:text-converse-accent' : 'hover:text-converse-sage'"
                @click.stop
            >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" /></svg>
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
