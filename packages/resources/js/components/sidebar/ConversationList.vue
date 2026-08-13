<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import ConversationListItem from "./ConversationListItem.vue";
import SearchBar from "./SearchBar.vue";
import NewChatModal from "./NewChatModal.vue";
import NewGroupModal from "./NewGroupModal.vue";
import StarredMessagesPanel from "../panels/StarredMessagesPanel.vue";
import BlockedUsersPanel from "../panels/BlockedUsersPanel.vue";
import Avatar from "../shared/Avatar.vue";
import { useConversations } from "../../composables/useConversations";
import { useMessages } from "../../composables/useMessages";
import { useUsers } from "../../composables/useUsers";
import { useChatLists } from "../../composables/useChatLists";
import { usePreferences } from "../../composables/usePreferences";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { useChatStore } from "../../store";
import { chatableKey } from "../../chatable";

const store = useChatStore();
const { refresh, setActive } = useConversations();
const { search: searchMessages } = useMessages();
const { resolve, get } = useUsers();
const { index: listChatLists, destroy: destroyChatList } = useChatLists();
const { effectiveTheme, toggleTheme } = usePreferences();
const { filter, setFilter, setView } = useSidebarUi();

const FILTERS = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "favourites", label: "Favourites" },
    { key: "groups", label: "Groups" },
];

const showNewChat = ref(false);
const showNewGroup = ref(false);
const showArchived = ref(false);
const showStarred = ref(false);
const showBlocked = ref(false);
const showMenu = ref(false);
const menuRoot = ref(null);
const searchQuery = ref("");
const messageHits = ref([]);
const searching = ref(false);
const lists = ref([]);
const showListsMenu = ref(false);
const listsMenuTrigger = ref(null);
const listsMenuPanel = ref(null);
const listsMenuPosition = ref({ top: 0, left: 0 });

function toggleListsMenu() {
    if (!showListsMenu.value && listsMenuTrigger.value) {
        const rect = listsMenuTrigger.value.getBoundingClientRect();
        listsMenuPosition.value = { top: rect.bottom + 4, left: rect.left };
    }
    showListsMenu.value = !showListsMenu.value;
}

const activeList = computed(() => {
    if (!filter.value.startsWith("list:")) return null;
    return (
        lists.value.find((l) => l.id === Number(filter.value.slice(5))) ?? null
    );
});

onMounted(() => {
    refresh();
    loadLists();
});

async function loadLists() {
    lists.value = await listChatLists();
}

async function deleteList(list) {
    await destroyChatList(list.id);
    if (filter.value === `list:${list.id}`) {
        setFilter("all");
    }
    await loadLists();
}

function onListsMenuDocumentClick(event) {
    const clickedTrigger = listsMenuTrigger.value?.contains(event.target);
    const clickedPanel = listsMenuPanel.value?.contains(event.target);
    if (!clickedTrigger && !clickedPanel) {
        showListsMenu.value = false;
    }
}

watch(showListsMenu, (open) => {
    if (open) {
        document.addEventListener("click", onListsMenuDocumentClick);
    } else {
        document.removeEventListener("click", onListsMenuDocumentClick);
    }
});

onBeforeUnmount(() =>
    document.removeEventListener("click", onListsMenuDocumentClick),
);

function onDocumentClick(event) {
    if (menuRoot.value && !menuRoot.value.contains(event.target)) {
        showMenu.value = false;
    }
}

watch(showMenu, (open) => {
    if (open) {
        document.addEventListener("click", onDocumentClick);
    } else {
        document.removeEventListener("click", onDocumentClick);
    }
});

onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick));

function toggleArchived() {
    showArchived.value = !showArchived.value;
    refresh(showArchived.value ? { archived: true } : {});
}

function select(conversationId) {
    setActive(conversationId);
}

function isFavourited(conversation) {
    return !!(conversation.favourited_at || conversation.me?.favourited_at);
}

const filteredConversations = computed(() => {
    if (filter.value.startsWith("list:")) {
        const listId = Number(filter.value.slice(5));
        const list = lists.value.find((l) => l.id === listId);
        const ids = list?.conversation_ids ?? [];
        return store.conversations.filter((c) => ids.includes(c.id));
    }

    switch (filter.value) {
        case "unread":
            return store.conversations.filter((c) => c.unread_count > 0);
        case "favourites":
            return store.conversations.filter(isFavourited);
        case "groups":
            return store.conversations.filter((c) => c.type === "group");
        default:
            return store.conversations;
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
        <div
            v-if="showArchived"
            class="cv-conversation-list__header flex items-center gap-3 border-b border-converse-border px-3 py-3"
        >
            <button
                type="button"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                title="Back to chats"
                @click="toggleArchived"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20Z"/></svg>
            </button>
            <h1 class="text-lg font-semibold text-converse-text">Archived chats</h1>
        </div>

        <div
            v-else
            class="cv-conversation-list__header flex items-center justify-between px-4 py-3"
        >
            <h1 class="font-display text-2xl font-normal text-converse-text">Converse</h1>

            <div class="cv-conversation-list__actions flex items-center gap-1.5">
                <button
                    type="button"
                    title="New chat"
                    class="flex h-9 items-center gap-1.5 rounded-full bg-converse-accent px-4 text-sm font-semibold text-converse-accentContrast hover:opacity-90"
                    @click="showNewChat = true"
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

                <div ref="menuRoot" class="relative">
                    <button
                        type="button"
                        title="Menu"
                        class="flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                        @click="showMenu = !showMenu"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill="currentColor"
                        >
                            <path
                                d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
                            />
                        </svg>
                    </button>

                    <div
                        v-if="showMenu"
                        class="cv-conversation-list__menu cv-animate-pop-in absolute right-0 top-full z-20 w-56 rounded-cv border border-converse-border bg-converse-surface py-1 text-sm shadow-lg"
                    >
                        <button
                            type="button"
                            class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover"
                            @click="
                                showNewGroup = true;
                                showMenu = false;
                            "
                        >
                            New group
                        </button>
                        <button
                            type="button"
                            class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover"
                            @click="
                                showStarred = true;
                                showMenu = false;
                            "
                        >
                            Starred messages
                        </button>
                        <button
                            type="button"
                            class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover"
                            @click="
                                showBlocked = true;
                                showMenu = false;
                            "
                        >
                            Blocked contacts
                        </button>
                        <button
                            type="button"
                            class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover"
                            @click="
                                toggleArchived();
                                showMenu = false;
                            "
                        >
                            Archived chats
                        </button>
                        <button
                            type="button"
                            class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover"
                            @click="
                                toggleTheme();
                                showMenu = false;
                            "
                        >
                            {{ effectiveTheme === "dark" ? "Light mode" : "Dark mode" }}
                        </button>
                        <button
                            type="button"
                            class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover"
                            @click="
                                setView('media');
                                showMenu = false;
                            "
                        >
                            Media
                        </button>
                        <button
                            type="button"
                            class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover"
                            @click="
                                setView('profile');
                                showMenu = false;
                            "
                        >
                            Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <SearchBar :autofocus="false" @query="onSearchQuery" />

        <div
            class="cv-conversation-list__filters flex items-center gap-2 overflow-x-auto px-3 pb-2"
        >
            <button
                v-for="f in FILTERS"
                :key="f.key"
                type="button"
                class="shrink-0 rounded-full px-3 py-1 text-sm font-medium"
                :class="
                    filter === f.key
                        ? 'bg-converse-accent/15 text-converse-accent'
                        : 'bg-converse-surfaceHover text-converse-text hover:bg-converse-border/50'
                "
                @click="setFilter(f.key)"
            >
                {{ f.label }}
            </button>

            <div class="shrink-0">
                <button
                    ref="listsMenuTrigger"
                    type="button"
                    class="flex shrink-0 items-center gap-1 rounded-full py-1 px-2 text-sm font-medium"
                    :class="
                        activeList
                            ? 'bg-converse-accent/15 text-converse-accent'
                            : 'bg-converse-surfaceHover text-converse-text hover:bg-converse-border/50'
                    "
                    @click="toggleListsMenu"
                >
                    {{ activeList ? activeList.name : "" }}
                    <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="currentColor"
                    >
                        <path d="M7 10l5 5 5-5Z" />
                    </svg>
                </button>

                <Teleport to="body">
                    <div
                        v-if="showListsMenu"
                        ref="listsMenuPanel"
                        class="cv-conversation-list__lists-menu cv-animate-pop-in fixed z-50 w-56 rounded-cv border border-converse-border bg-converse-surface py-1 text-sm shadow-lg"
                        :style="{
                            top: `${listsMenuPosition.top}px`,
                            left: `${listsMenuPosition.left}px`,
                        }"
                    >
                        <p
                            v-if="!lists.length"
                            class="px-4 py-2 text-converse-textMuted"
                        >
                            No lists yet.
                        </p>
                        <div
                            v-for="list in lists"
                            :key="list.id"
                            class="group/list flex items-center justify-between px-2 py-1 hover:bg-converse-surfaceHover"
                        >
                            <button
                                type="button"
                                class="flex-1 truncate px-2 py-1 text-left"
                                :class="
                                    filter === `list:${list.id}`
                                        ? 'text-converse-accent'
                                        : 'text-converse-text'
                                "
                                @click="
                                    setFilter(`list:${list.id}`);
                                    showListsMenu = false;
                                "
                            >
                                {{ list.name }}
                            </button>
                            <span
                                role="button"
                                title="Delete list"
                                class="hidden shrink-0 rounded-full px-2 text-converse-textMuted opacity-0 hover:text-converse-danger group-hover/list:inline group-hover/list:opacity-100"
                                @click.stop="deleteList(list)"
                                >×</span
                            >
                        </div>
                        <hr class="my-1 border-converse-border" />
                        <button
                            type="button"
                            class="block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover"
                            @click="
                                setView('create-list');
                                showListsMenu = false;
                            "
                        >
                            Create new list
                        </button>
                    </div>
                </Teleport>
            </div>
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

        <ul v-else class="cv-conversation-list__items flex-1 overflow-y-auto px-2 py-1">
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

        <NewChatModal v-if="showNewChat" @close="showNewChat = false" />
        <NewGroupModal v-if="showNewGroup" @close="showNewGroup = false" />
        <StarredMessagesPanel v-if="showStarred" @close="showStarred = false" />
        <BlockedUsersPanel v-if="showBlocked" @close="showBlocked = false" />
    </div>
</template>
