<script setup>
import { computed, ref } from "vue";
import MediaViewerModal from "../../shared/MediaViewerModal.vue";

const props = defineProps({
    attachments: { type: Array, required: true },
    kind: { type: String, default: "image" }, // 'image' | 'video' | 'document'
    badge: { type: String, default: null },
});

const viewerIndex = ref(null);

const cols = computed(() =>
    props.attachments.length === 1 ? "minmax(0, 1fr)" : "minmax(0, 1fr) minmax(0, 1fr)",
);

// Only the first 4 tiles ever render; the 4th absorbs everything past it behind a "+N"
// overlay rather than growing the grid unbounded. A lone 3-item album gets its own layout —
// item 1 spans the full width above the other two — everything else is a plain square grid.
const tiles = computed(() => {
    const total = props.attachments.length;
    return props.attachments.slice(0, 4).map((attachment, index) => {
        // The lead-tile treatment only reads naturally for a landscape photo/video thumbnail —
        // forcing a document's icon+filename into the same wide 2:1 tile just leaves it stranded
        // in a sea of empty padding, so documents stay in the plain square grid regardless of count.
        const isLeadOfThree = total === 3 && index === 0 && props.kind !== "document";
        return {
            attachment,
            ratio: total === 1 ? "4 / 3" : isLeadOfThree ? "2 / 1" : "1 / 1",
            span: isLeadOfThree ? "1 / -1" : "auto",
            more: index === 3 && total > 4 ? `+${total - 3}` : null,
        };
    });
});

const viewerItems = computed(() =>
    props.attachments.map((attachment) => ({
        url: attachment.url,
        kind: props.kind,
        mime_type: attachment.mime_type,
        original_filename: attachment.original_filename,
    })),
);
</script>

<template>
    <div
        class="chat-album-grid overflow-hidden rounded-2xl"
        style="display: grid; gap: 3px"
        :style="{ gridTemplateColumns: cols }"
    >
        <button
            v-for="(tile, index) in tiles"
            :key="tile.attachment.id"
            type="button"
            title="View"
            class="relative block min-w-0 bg-riwaaq-surfaceHover"
            :style="{ gridColumn: tile.span, aspectRatio: tile.ratio }"
            @click="viewerIndex = index"
        >
            <video
                v-if="kind === 'video'"
                :src="tile.attachment.url"
                preload="metadata"
                muted
                playsinline
                class="h-full w-full object-cover"
            />
            <div
                v-else-if="kind === 'document'"
                class="flex h-full w-full flex-col items-center justify-center gap-1.5 p-2 text-center"
            >
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" class="shrink-0 text-riwaaq-textMuted"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></svg>
                <span class="line-clamp-2 w-full break-words text-[10.5px] font-medium leading-tight text-riwaaq-textMuted">{{ tile.attachment.original_filename }}</span>
            </div>
            <img
                v-else
                :src="tile.attachment.thumbnail_url || tile.attachment.url"
                :alt="tile.attachment.original_filename"
                class="h-full w-full object-cover"
            />

            <span
                v-if="kind === 'video' && !tile.more"
                class="absolute inset-0 flex items-center justify-center"
            >
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-riwaaq-surface shadow">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="text-riwaaq-accent"><path d="M8 5.5l11 6.5-11 6.5Z" /></svg>
                </span>
            </span>

            <span
                v-if="badge && !tile.more"
                class="absolute left-1.5 top-1.5 rounded bg-riwaaq-overlay/60 px-1.5 py-0.5 text-[10px] font-medium text-white"
            >
                {{ badge }}
            </span>

            <span
                v-if="tile.more"
                class="absolute inset-0 flex items-center justify-center bg-riwaaq-overlay/55 text-lg font-bold text-white"
            >
                {{ tile.more }}
            </span>
        </button>
    </div>

    <MediaViewerModal
        v-if="viewerIndex !== null"
        :items="viewerItems"
        :index="viewerIndex"
        @close="viewerIndex = null"
    />
</template>
