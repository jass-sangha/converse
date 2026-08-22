<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useMessages } from "../../composables/useMessages";
import { useChatStore } from "../../store";
import MediaViewerModal from "../shared/MediaViewerModal.vue";
import Icon from "../shared/Icon.vue";

const props = defineProps({
    // A single conversation's items when set; every conversation the user is in when null.
    conversationId: { type: Number, default: null },
});

const messagesApi = useMessages();
const store = useChatStore();

const MEDIA_TYPES = new Set(["image", "video", "gif", "sticker"]);
const URL_PATTERN = /https?:\/\/\S+/;

function kindOf(message) {
    if (MEDIA_TYPES.has(message.type)) return "media";
    if (message.type === "document") return "docs";
    if (message.type === "text" && URL_PATTERN.test(message.body ?? ""))
        return "links";
    return null;
}

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

// Items come from this panel's own paginated fetch, not the shared message store, so a new
// message (sent locally or via realtime) wouldn't show up here until the panel is reopened —
// mirror it in directly instead. The global panel (no conversationId prop) has no single
// conversation to watch, so it falls back to whichever one the chat window next to it is
// currently showing — the only conversation this session gets realtime updates for anyway.
watch(
    () => {
        const targetId = props.conversationId ?? store.activeConversationId;
        if (!targetId) return null;
        const list = store.messagesByConversation[targetId];
        return list?.[list.length - 1] ?? null;
    },
    (last) => {
        if (!last || last.deleted_for_everyone || state.search) return;

        const kind = kindOf(last);
        if (!kind) return;

        const bucket = state.byKind[kind];
        if (!bucket.loaded || bucket.items[0]?.id === last.id) return;

        bucket.items = [last, ...bucket.items];
    },
);

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

const docViewerItems = computed(() =>
    docItems.value.map((item) => ({
        url: item.url,
        kind: "document",
        mime_type: item.mime_type,
        original_filename: item.original_filename,
    })),
);

const viewerIndex = ref(null);
const viewerItems = computed(() =>
    state.tab === "docs" ? docViewerItems.value : mediaItems.value,
);

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
    <div class="chat-media-docs-links flex min-h-0 flex-1 flex-col">
        <div class="px-4">
            <div class="relative">
                <Icon
                    name="search-outline"
                    :size="14"
                    class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-riwaaq-textMuted"
                />
                <input
                    v-model="state.search"
                    type="text"
                    :placeholder="
                        conversationId
                            ? 'Search by filename'
                            : 'Search by chat, contact, or filename'
                    "
                    class="chat-media-docs-links__search h-11 w-full rounded-full border border-riwaaq-border bg-riwaaq-surfaceHover pl-10 pr-4 text-sm text-riwaaq-text focus:outline-none"
                />
            </div>
        </div>

        <div class="flex items-center justify-center gap-1 px-4 pb-1 pt-3">
            <div
                class="flex items-center w-full gap-1 rounded-full border border-riwaaq-border bg-riwaaq-surfaceHover p-1 mb-2"
            >
                <button
                    v-for="t in TABS"
                    :key="t.key"
                    type="button"
                    class="flex-1 rounded-full px-4 py-1.5 text-sm font-semibold"
                    :class="
                        state.tab === t.key
                            ? 'bg-riwaaq-accent text-riwaaq-accentContrast'
                            : 'text-riwaaq-textMuted hover:text-riwaaq-text'
                    "
                    @click="state.tab = t.key"
                >
                    {{ t.label }}
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 pt-0 pb-12">
            <template v-if="state.tab === 'media'">
                <div v-if="mediaItems.length" class="grid grid-cols-3 gap-1">
                    <button
                        v-for="(item, i) in mediaItems"
                        :key="item.id"
                        type="button"
                        :title="item.original_filename"
                        class="group relative aspect-square overflow-hidden rounded-xl bg-riwaaq-surfaceHover"
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
                            class="absolute bottom-1 right-1 max-w-[calc(100%-20px)] truncate rounded-md bg-riwaaq-surface/85 px-1.5 py-0.5 text-[9px] font-medium text-riwaaq-textMuted"
                            >{{ item.original_filename }}</span
                        >
                    </button>
                </div>
                <p
                    v-else-if="!activeBucket.loading"
                    class="p-4 text-center text-sm text-riwaaq-textMuted"
                >
                    {{ state.search ? "No matching media." : "No media yet." }}
                </p>
            </template>

            <template v-else-if="state.tab === 'docs'">
                <ul v-if="docItems.length" class="flex flex-col gap-1">
                    <li v-for="(item, i) in docItems" :key="item.id">
                        <button
                            type="button"
                            class="flex w-full items-center gap-2 rounded-2xl p-2 text-left hover:bg-riwaaq-surfaceHover"
                            @click="viewerIndex = i"
                        >
                            <span
                                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white"
                            >
                                <Icon name="file" :size="16" />
                            </span>
                            <span class="min-w-0 flex-1">
                                <span
                                    class="block truncate text-sm text-riwaaq-text"
                                    >{{ item.original_filename }}</span
                                >
                                <span
                                    class="block text-xs text-riwaaq-textMuted"
                                    >{{ formatSize(item.size_bytes) }}</span
                                >
                            </span>
                        </button>
                    </li>
                </ul>
                <p
                    v-else-if="!activeBucket.loading"
                    class="p-4 text-center text-sm text-riwaaq-textMuted"
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
                            class="flex items-center gap-2 rounded-2xl p-2 hover:bg-riwaaq-surfaceHover"
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
                                <Icon name="link" :size="16" />
                            </span>
                            <span class="min-w-0 flex-1">
                                <span
                                    class="block truncate text-sm text-riwaaq-text"
                                    >{{ link.title || link.url }}</span
                                >
                                <span
                                    class="block truncate text-xs text-riwaaq-textMuted"
                                    >{{ link.url }}</span
                                >
                            </span>
                        </a>
                    </li>
                </ul>
                <p
                    v-else-if="!activeBucket.loading"
                    class="p-4 text-center text-sm text-riwaaq-textMuted"
                >
                    {{ state.search ? "No matching links." : "No links yet." }}
                </p>
            </template>

            <p
                v-if="activeBucket.loading"
                class="p-4 text-center text-sm text-riwaaq-textMuted"
            >
                Loading…
            </p>

            <button
                v-if="hasMore && !activeBucket.loading"
                type="button"
                class="mx-auto mt-2 block rounded px-3 py-1.5 text-sm text-riwaaq-accent hover:bg-riwaaq-surfaceHover"
                @click="loadKind(state.tab)"
            >
                Load more
            </button>
        </div>

        <MediaViewerModal
            v-if="viewerIndex !== null"
            :items="viewerItems"
            :index="viewerIndex"
            @close="viewerIndex = null"
        />
    </div>
</template>
