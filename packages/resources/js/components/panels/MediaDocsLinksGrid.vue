<script setup>
import { computed, ref } from 'vue';
import { useChatStore } from '../../store';

const props = defineProps({
    // A single conversation's items when set; every loaded conversation's items when null.
    conversationId: { type: Number, default: null },
});

const store = useChatStore();
const tab = ref('media');

const TABS = [
    { key: 'media', label: 'Media' },
    { key: 'docs', label: 'Docs' },
    { key: 'links', label: 'Links' },
];

const conversationIds = computed(() => (
    props.conversationId ? [props.conversationId] : store.conversations.map((c) => c.id)
));

const messages = computed(() => conversationIds.value
    .flatMap((id) => store.messagesByConversation[id] ?? [])
    .filter((m) => !m.deleted_for_everyone)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

const mediaItems = computed(() => messages.value
    .filter((m) => ['image', 'video', 'gif'].includes(m.type))
    .flatMap((m) => (m.attachments ?? []).map((a) => ({ ...a, kind: m.type, createdAt: m.created_at }))));

const docItems = computed(() => messages.value
    .filter((m) => m.type === 'document')
    .flatMap((m) => (m.attachments ?? []).map((a) => ({ ...a, createdAt: m.created_at }))));

const linkItems = computed(() => messages.value
    .filter((m) => m.type === 'text' && m.metadata?.link_preview)
    .map((m) => ({ ...m.metadata.link_preview, createdAt: m.created_at })));

const counts = computed(() => ({ media: mediaItems.value.length, docs: docItems.value.length, links: linkItems.value.length }));

function formatSize(bytes) {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}
</script>

<template>
    <div class="cv-media-docs-links flex h-full flex-col">
        <div class="flex items-center gap-2 border-b border-converse-border px-3 pt-1">
            <button
                v-for="t in TABS"
                :key="t.key"
                type="button"
                class="shrink-0 border-b-2 px-3 py-2 text-sm font-medium"
                :class="tab === t.key ? 'border-converse-accent text-converse-accent' : 'border-transparent text-converse-textMuted hover:text-converse-text'"
                @click="tab = t.key"
            >
                {{ t.label }} <span v-if="counts[t.key]" class="text-xs">({{ counts[t.key] }})</span>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-3">
            <template v-if="tab === 'media'">
                <div v-if="mediaItems.length" class="grid grid-cols-3 gap-1">
                    <a
                        v-for="item in mediaItems"
                        :key="item.id"
                        :href="item.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="relative aspect-square overflow-hidden rounded-sm bg-converse-surfaceHover"
                    >
                        <video v-if="item.kind === 'video'" :src="item.url" class="h-full w-full object-cover" muted />
                        <img v-else :src="item.thumbnail_url || item.url" :alt="item.original_filename" class="h-full w-full object-cover">
                    </a>
                </div>
                <p v-else class="p-4 text-center text-sm text-converse-textMuted">No media yet.</p>
            </template>

            <template v-else-if="tab === 'docs'">
                <ul v-if="docItems.length" class="flex flex-col gap-1">
                    <li v-for="item in docItems" :key="item.id">
                        <a
                            :href="item.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-2 rounded p-2 hover:bg-converse-surfaceHover"
                        >
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5Z"/></svg>
                            </span>
                            <span class="min-w-0 flex-1">
                                <span class="block truncate text-sm text-converse-text">{{ item.original_filename }}</span>
                                <span class="block text-xs text-converse-textMuted">{{ formatSize(item.size_bytes) }}</span>
                            </span>
                        </a>
                    </li>
                </ul>
                <p v-else class="p-4 text-center text-sm text-converse-textMuted">No documents yet.</p>
            </template>

            <template v-else>
                <ul v-if="linkItems.length" class="flex flex-col gap-1">
                    <li v-for="(link, index) in linkItems" :key="index">
                        <a
                            :href="link.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-2 rounded p-2 hover:bg-converse-surfaceHover"
                        >
                            <img v-if="link.image" :src="link.image" class="h-9 w-9 shrink-0 rounded object-cover">
                            <span v-else class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3.9 12a4.1 4.1 0 0 1 4.1-4.1h4v-2h-4a6.1 6.1 0 0 0 0 12.2h4v-2h-4A4.1 4.1 0 0 1 3.9 12ZM8 13h8v-2H8Zm8-6h-4v2h4a4.1 4.1 0 0 1 0 8.2h-4v2h4a6.1 6.1 0 0 0 0-12.2Z"/></svg>
                            </span>
                            <span class="min-w-0 flex-1">
                                <span class="block truncate text-sm text-converse-text">{{ link.title || link.url }}</span>
                                <span class="block truncate text-xs text-converse-textMuted">{{ link.url }}</span>
                            </span>
                        </a>
                    </li>
                </ul>
                <p v-else class="p-4 text-center text-sm text-converse-textMuted">No links yet.</p>
            </template>
        </div>
    </div>
</template>
