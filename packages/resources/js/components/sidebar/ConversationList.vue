<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import ConversationListItem from "./ConversationListItem.vue";
import SearchBar from "./SearchBar.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import Avatar from "../shared/Avatar.vue";
import { useConversations } from "../../composables/useConversations";
import { useMessages } from "../../composables/useMessages";
import { useUsers } from "../../composables/useUsers";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { useChatStore } from "../../store";
import { chatableKey } from "../../chatable";

const store = useChatStore();
const { refresh, setActive } = useConversations();
const { search: searchMessages } = useMessages();
const { resolve, get } = useUsers();
const { view, filter, setFilter, setView } = useSidebarUi();

const FILTERS = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "favourites", label: "Favourites" },
    { key: "groups", label: "Groups" },
];

const showArchived = computed(() => view.value === "archived");
const searchQuery = ref("");
const messageHits = ref([]);
const searching = ref(false);
const listRoot = ref(null);

async function scrollActiveIntoView({ block = "nearest" } = {}) {
    const conversationId = store.activeConversationId;
    if (!conversationId) return;
    await nextTick();
    listRoot.value
        ?.querySelector(`[data-conversation-id="${conversationId}"]`)
        ?.scrollIntoView({ block, behavior: "smooth" });
}

onMounted(async () => {
    await refresh(showArchived.value ? { archived: true } : {});
    // A freshly created chat/group sorts first — land the list at the top to show it.
    await scrollActiveIntoView({ block: "start" });
});

watch(showArchived, (archived) => {
    refresh(archived ? { archived: true } : {});
});

watch(() => store.activeConversationId, () => scrollActiveIntoView());

function toggleArchived() {
    setView(showArchived.value ? "chats" : "archived");
}

function select(conversationId) {
    setActive(conversationId);
}

function isFavourited(conversation) {
    return !!(conversation.favourited_at || conversation.me?.favourited_at);
}

// Mirrors the backend's own ORDER BY exactly (pinned first, most-recently-pinned first among
// those, then most-recently-active) — `upsertConversation()` only patches a conversation's data
// in place at its existing array index, it never re-sorts, so without this a freshly pinned (or
// unpinned) chat would keep its old position until the next full list refetch.
function sortKey(conversation) {
    const pinnedAt = conversation.me?.pinned_at ? new Date(conversation.me.pinned_at).getTime() : null;
    const lastActivityAt = conversation.last_activity_at ? new Date(conversation.last_activity_at).getTime() : 0;
    return { pinnedAt, lastActivityAt };
}

const sortedConversations = computed(() =>
    [...store.conversations].sort((a, b) => {
        const ka = sortKey(a);
        const kb = sortKey(b);
        if ((ka.pinnedAt !== null) !== (kb.pinnedAt !== null)) {
            return ka.pinnedAt !== null ? -1 : 1;
        }
        if (ka.pinnedAt !== null && kb.pinnedAt !== null && ka.pinnedAt !== kb.pinnedAt) {
            return kb.pinnedAt - ka.pinnedAt;
        }
        return kb.lastActivityAt - ka.lastActivityAt;
    }),
);

const filteredConversations = computed(() => {
    // `refresh()` keeps the conversation open on the right in the store even when a filtered
    // fetch excludes it (e.g. Archived), so the chat window doesn't lose it — exclude it here
    // when it doesn't actually belong in the Archived list, so it doesn't leak into view.
    const source = showArchived.value
        ? sortedConversations.value.filter((c) => c.me?.archived_at)
        : sortedConversations.value;

    switch (filter.value) {
        case "unread":
            return source.filter((c) => c.unread_count > 0);
        case "favourites":
            return source.filter(isFavourited);
        case "groups":
            return source.filter((c) => c.type === "group");
        default:
            return source;
    }
});

async function onSearchQuery(q) {
    searchQuery.value = q;

    if (!q) {
        messageHits.value = [];
        await refresh();
        return;
    }

    searching.value = true;
    try {
        const [, hits] = await Promise.all([
            refresh({ q }),
            searchMessages(q, null),
        ]);

        const refs = hits
            .map((hit) => otherParticipantOf(hit.conversation))
            .filter(Boolean);
        if (refs.length) {
            const unique = [
                ...new Map(
                    refs.map((r) => [chatableKey(r.type, r.id), r]),
                ).values(),
            ];
            await resolve(unique);
        }

        messageHits.value = hits;
    } finally {
        searching.value = false;
    }
}

function otherParticipantOf(conversation) {
    if (!conversation || conversation.type !== "private") return null;
    return (
        (conversation.participants ?? []).find(
            (p) => chatableKey(p.type, p.id) !== store.currentKey,
        ) ?? null
    );
}

function hitLabel(hit) {
    if (!hit.conversation) return "";
    if (hit.conversation.type === "group")
        return hit.conversation.name || "Group";
    const other = otherParticipantOf(hit.conversation);
    return other ? get(other).name : "Unknown";
}

function hitAvatar(hit) {
    if (!hit.conversation || hit.conversation.type === "group") return null;
    const other = otherParticipantOf(hit.conversation);
    return other ? get(other).avatar_url : null;
}

function hitSnippet(hit) {
    if (hit.deleted_for_everyone) return "This message was deleted";
    return hit.type === "text" ? hit.body : `[${hit.type}]`;
}

function openHit(hit) {
    store.pendingScrollMessageId = hit.id;
    setActive(hit.conversation_id);
    onSearchQuery("");
}
</script>

<template>
    <div class="cv-conversation-list flex h-full flex-col bg-converse-surface">
        <SidebarScreenHeader
            v-if="showArchived"
            title="Archived chats"
            @back="toggleArchived"
        >
            <GlobalMenu />
        </SidebarScreenHeader>

        <div
            v-else
            class="cv-conversation-list__header flex items-center justify-between px-4 py-3"
        >
            <h1 class="font-display text-2xl font-normal text-converse-text">
                Converse
            </h1>

            <div
                class="cv-conversation-list__actions flex items-center gap-1.5"
            >
                <button
                    v-if="view !== 'new-chat'"
                    type="button"
                    title="New chat"
                    class="flex h-9 items-center gap-1.5 rounded-full bg-converse-accent px-4 text-sm font-semibold text-converse-accentContrast hover:opacity-90"
                    @click="setView('new-chat')"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.75"
                        stroke-linecap="round"
                    >
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    New
                </button>

                <GlobalMenu />
            </div>
        </div>

        <SearchBar :autofocus="false" @query="onSearchQuery" />

        <div
            class="cv-conversation-list__filters flex items-center gap-2 overflow-x-auto overflow-y-visible px-3 pb-3.5 pt-0.5"
        >
            <button
                v-for="f in FILTERS"
                :key="f.key"
                type="button"
                class="relative h-8 shrink-0 rounded-full border border-converse-border px-[15px] text-[12.5px] font-semibold text-converse-textMuted"
                @click="setFilter(f.key)"
            >
                <span
                    v-if="filter === f.key"
                    class="absolute -inset-px rounded-full border border-converse-sageLine bg-converse-sageTint"
                />
                <span class="relative">{{ f.label }}</span>
            </button>
        </div>

        <div
            v-if="searchQuery"
            class="cv-conversation-list__search-results flex-1 overflow-y-auto"
        >
            <p
                v-if="searching"
                class="p-4 text-center text-sm text-converse-textMuted"
            >
                Searching&hellip;
            </p>

            <template v-else>
                <h3
                    v-if="filteredConversations.length"
                    class="px-4 pb-1 pt-3 text-xs font-medium uppercase text-converse-textMuted"
                >
                    Chats
                </h3>
                <ul class="px-2 py-1">
                    <ConversationListItem
                        v-for="conversation in filteredConversations"
                        :key="conversation.id"
                        :conversation="conversation"
                        :active="conversation.id === store.activeConversationId"
                        @select="select"
                    />
                </ul>

                <h3
                    v-if="messageHits.length"
                    class="px-4 pb-1 pt-3 text-xs font-medium uppercase text-converse-textMuted"
                >
                    Messages
                </h3>
                <ul class="px-2 py-1">
                    <li
                        v-for="hit in messageHits"
                        :key="hit.id"
                        class="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-converse-surfaceHover"
                        @click="openHit(hit)"
                    >
                        <Avatar
                            :name="hitLabel(hit)"
                            :avatar-url="hitAvatar(hit)"
                            :size="44"
                        />
                        <div class="min-w-0 flex-1">
                            <span
                                class="block truncate text-[15px] text-converse-text"
                                >{{ hitLabel(hit) }}</span
                            >
                            <span
                                class="block truncate text-sm text-converse-textMuted"
                                >{{ hitSnippet(hit) }}</span
                            >
                        </div>
                    </li>
                </ul>

                <p
                    v-if="!filteredConversations.length && !messageHits.length"
                    class="p-4 text-center text-sm text-converse-textMuted"
                >
                    No results for "{{ searchQuery }}".
                </p>
            </template>
        </div>

        <ul
            v-else
            ref="listRoot"
            class="cv-conversation-list__items flex-1 overflow-y-auto px-2 py-1"
        >
            <ConversationListItem
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                :conversation="conversation"
                :active="conversation.id === store.activeConversationId"
                @select="select"
            />
            <li
                v-if="!filteredConversations.length"
                class="cv-conversation-list__empty p-4 text-center text-sm text-converse-textMuted"
            >
                No conversations here.
            </li>
        </ul>
    </div>
</template>
