<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useMessages } from "../../composables/useMessages";
import MediaViewerModal from "../shared/MediaViewerModal.vue";

const props = defineProps({
    // A single conversation's items when set; every conversation the user is in when null.
    conversationId: { type: Number, default: null },
});

const messagesApi = useMessages();

const TABS = [
    { key: "media", label: "Media" },
    { key: "docs", label: "Docs" },
    { key: "links", label: "Links" },
];

const state = reactive({
    tab: "media",
    search: "",
    byKind: {
        media: {
            items: [],
            page: 0,
            lastPage: 1,
            loading: false,
            loaded: false,
        },
        docs: {
            items: [],
            page: 0,
            lastPage: 1,
            loading: false,
            loaded: false,
        },
        links: {
            items: [],
            page: 0,
            lastPage: 1,
            loading: false,
            loaded: false,
        },
    },
});

async function loadKind(kind, { reset = false } = {}) {
    const bucket = state.byKind[kind];
    if (bucket.loading) return;
    if (!reset && bucket.loaded && bucket.page >= bucket.lastPage) return;

    bucket.loading = true;
    try {
        const nextPage = reset ? 1 : bucket.page + 1;
        const response = await messagesApi.media(
            kind,
            props.conversationId,
            nextPage,
            state.search,
        );
        bucket.items = reset
            ? response.data
            : [...bucket.items, ...response.data];
        bucket.page = response.meta?.current_page ?? nextPage;
        bucket.lastPage = response.meta?.last_page ?? bucket.page;
        bucket.loaded = true;
    } finally {
        bucket.loading = false;
    }
}

function resetAll() {
    for (const kind of Object.keys(state.byKind)) {
        state.byKind[kind] = {
            items: [],
            page: 0,
            lastPage: 1,
            loading: false,
            loaded: false,
        };
    }
    loadKind(state.tab, { reset: true });
}

watch(() => props.conversationId, resetAll);

watch(
    () => state.tab,
    (kind) => {
        if (!state.byKind[kind].loaded) {
            loadKind(kind, { reset: true });
        }
    },
);

let searchDebounce = null;
watch(
    () => state.search,
    () => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(resetAll, 250);
    },
);

loadKind(state.tab, { reset: true });

const mediaItems = computed(() =>
    state.byKind.media.items
        .filter((m) => !m.deleted_for_everyone)
        .flatMap((m) =>
            (m.attachments ?? []).map((a) => ({
                ...a,
                kind: m.type,
                createdAt: m.created_at,
            })),
        ),
);

const docItems = computed(() =>
    state.byKind.docs.items
        .filter((m) => !m.deleted_for_everyone)
        .flatMap((m) =>
            (m.attachments ?? []).map((a) => ({
                ...a,
                createdAt: m.created_at,
            })),
        ),
);

const URL_PATTERN = /https?:\/\/\S+/;

// Not every link-containing message has a fetched OG preview (that fetch races the send, and
// can fail or simply never finish in time) — fall back to the bare URL pulled from the body so
// the message still shows up here, just without a thumbnail/title.
const linkItems = computed(() =>
    state.byKind.links.items
        .filter((m) => !m.deleted_for_everyone)
        .map((m) => {
            if (m.metadata?.link_preview)
                return { ...m.metadata.link_preview, createdAt: m.created_at };
            const url = m.body?.match(URL_PATTERN)?.[0];
            return url
                ? { url, title: null, image: null, createdAt: m.created_at }
                : null;
        })
        .filter(Boolean),
);

const viewerIndex = ref(null);

const activeBucket = computed(() => state.byKind[state.tab]);
const hasMore = computed(
    () => activeBucket.value.page < activeBucket.value.lastPage,
);

function formatSize(bytes) {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}
</script>

<template>
    <div class="cv-media-docs-links flex h-full flex-col">
        <div class="px-4 pt-3">
            <div class="relative">
                <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-converse-textMuted"
                >
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M16 16l4 4" />
                </svg>
                <input
                    v-model="state.search"
                    type="text"
                    :placeholder="
                        conversationId
                            ? 'Search by filename'
                            : 'Search by chat, contact, or filename'
                    "
                    class="cv-media-docs-links__search h-11 w-full rounded-full border border-converse-border bg-converse-surfaceHover pl-10 pr-4 text-sm text-converse-text focus:outline-none"
                />
            </div>
        </div>

        <div class="flex items-center justify-center gap-1 px-4 pb-1 pt-3">
            <div
                class="flex items-center w-full gap-1 rounded-full border border-converse-border bg-converse-surfaceHover p-1"
            >
                <button
                    v-for="t in TABS"
                    :key="t.key"
                    type="button"
                    class="flex-1 rounded-full px-4 py-1.5 text-sm font-semibold"
                    :class="
                        state.tab === t.key
                            ? 'bg-converse-accent text-converse-accentContrast'
                            : 'text-converse-textMuted hover:text-converse-text'
                    "
                    @click="state.tab = t.key"
                >
                    {{ t.label }}
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3">
            <template v-if="state.tab === 'media'">
                <div v-if="mediaItems.length" class="grid grid-cols-3 gap-1">
                    <button
                        v-for="(item, i) in mediaItems"
                        :key="item.id"
                        type="button"
                        :title="item.original_filename"
                        class="group relative aspect-square overflow-hidden rounded-xl bg-converse-surfaceHover"
                        @click="viewerIndex = i"
                    >
                        <video
                            v-if="item.kind === 'video'"
                            :src="item.url"
                            class="h-full w-full object-cover"
                            muted
                        />
                        <img
                            v-else
                            :src="item.thumbnail_url || item.url"
                            :alt="item.original_filename"
                            class="h-full w-full object-cover"
                        />
                        <span
                            v-if="item.original_filename"
                            class="absolute bottom-1 right-1 max-w-[calc(100%-20px)] truncate rounded-md bg-converse-surface/85 px-1.5 py-0.5 text-[9px] font-medium text-converse-textMuted"
                            >{{ item.original_filename }}</span
                        >
                    </button>
                </div>
                <p
                    v-else-if="!activeBucket.loading"
                    class="p-4 text-center text-sm text-converse-textMuted"
                >
                    {{ state.search ? "No matching media." : "No media yet." }}
                </p>
            </template>

            <template v-else-if="state.tab === 'docs'">
                <ul v-if="docItems.length" class="flex flex-col gap-1">
                    <li v-for="item in docItems" :key="item.id">
                        <a
                            :href="item.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-2 rounded p-2 hover:bg-converse-surfaceHover"
                        >
                            <span
                                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5Z"
                                    />
                                </svg>
                            </span>
                            <span class="min-w-0 flex-1">
                                <span
                                    class="block truncate text-sm text-converse-text"
                                    >{{ item.original_filename }}</span
                                >
                                <span
                                    class="block text-xs text-converse-textMuted"
                                    >{{ formatSize(item.size_bytes) }}</span
                                >
                            </span>
                        </a>
                    </li>
                </ul>
                <p
                    v-else-if="!activeBucket.loading"
                    class="p-4 text-center text-sm text-converse-textMuted"
                >
                    {{
                        state.search
                            ? "No matching documents."
                            : "No documents yet."
                    }}
                </p>
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
                            <img
                                v-if="link.image"
                                :src="link.image"
                                class="h-9 w-9 shrink-0 rounded object-cover"
                            />
                            <span
                                v-else
                                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M3.9 12a4.1 4.1 0 0 1 4.1-4.1h4v-2h-4a6.1 6.1 0 0 0 0 12.2h4v-2h-4A4.1 4.1 0 0 1 3.9 12ZM8 13h8v-2H8Zm8-6h-4v2h4a4.1 4.1 0 0 1 0 8.2h-4v2h4a6.1 6.1 0 0 0 0-12.2Z"
                                    />
                                </svg>
                            </span>
                            <span class="min-w-0 flex-1">
                                <span
                                    class="block truncate text-sm text-converse-text"
                                    >{{ link.title || link.url }}</span
                                >
                                <span
                                    class="block truncate text-xs text-converse-textMuted"
                                    >{{ link.url }}</span
                                >
                            </span>
                        </a>
                    </li>
                </ul>
                <p
                    v-else-if="!activeBucket.loading"
                    class="p-4 text-center text-sm text-converse-textMuted"
                >
                    {{ state.search ? "No matching links." : "No links yet." }}
                </p>
            </template>

            <p
                v-if="activeBucket.loading"
                class="p-4 text-center text-sm text-converse-textMuted"
            >
                Loading…
            </p>

            <button
                v-if="hasMore && !activeBucket.loading"
                type="button"
                class="mx-auto mt-2 block rounded px-3 py-1.5 text-sm text-converse-accent hover:bg-converse-surfaceHover"
                @click="loadKind(state.tab)"
            >
                Load more
            </button>
        </div>

        <MediaViewerModal
            v-if="viewerIndex !== null"
            :items="mediaItems"
            :index="viewerIndex"
            @close="viewerIndex = null"
        />
    </div>
</template>
