<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Avatar from "../shared/Avatar.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import { useBlockedUsers } from "../../composables/useBlockedUsers";
import { useUsers } from "../../composables/useUsers";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { useChatStore } from "../../store";

const { setView } = useSidebarUi();
const { list: listBlocked, unblock } = useBlockedUsers();
const { resolve: resolveUsers, get: getUser } = useUsers();
const store = useChatStore();

function rowKey(row) {
    return `${row.blocked_type}:${row.blocked_id}`;
}

const blockedRows = ref([]);
const loading = ref(false);
const unblockingKey = ref(null);
const page = ref(0);
const lastPage = ref(1);

const scrollEl = ref(null);
const sentinelEl = ref(null);
let observer = null;

async function loadPage() {
    if (loading.value || page.value >= lastPage.value) return;

    loading.value = true;
    try {
        const nextPage = page.value + 1;
        const response = await listBlocked(nextPage);
        blockedRows.value = [...blockedRows.value, ...response.data];
        await resolveUsers(
            response.data.map((r) => ({ type: r.blocked_type, id: r.blocked_id })),
        );
        page.value = response.meta?.current_page ?? nextPage;
        lastPage.value = response.meta?.last_page ?? page.value;
    } finally {
        loading.value = false;
    }
}

function onIntersect(entries) {
    if (entries[0].isIntersecting) loadPage();
}

function setupObserver() {
    observer?.disconnect();
    if (sentinelEl.value) {
        observer = new IntersectionObserver(onIntersect, { root: scrollEl.value });
        observer.observe(sentinelEl.value);
    }
}

onMounted(async () => {
    await loadPage();
    await nextTick();
    setupObserver();
});

onBeforeUnmount(() => observer?.disconnect());

async function onUnblock(row) {
    const key = rowKey(row);
    unblockingKey.value = key;
    try {
        await unblock(row.blocked_type, row.blocked_id);
        blockedRows.value = blockedRows.value.filter((r) => r !== row);
    } finally {
        unblockingKey.value = null;
    }
}

// `store.blockedKeys` is the shared source of truth `block()`/`unblock()` update from anywhere in
// the app (chat header, group info, ...) — this panel's own `blockedRows` comes from its own
// paginated fetch instead, so blocking/unblocking someone while this panel stays open otherwise
// only shows up the next time it's closed and reopened. Diff old vs new keys and only add/remove
// the ones that actually changed — rebuilding the whole list from blockedKeys on every change
// would reorder every existing row to match that array's order instead of just the one that
// changed (the same shuffling bug already fixed for the starred-messages panel).
watch(
    () => store.blockedKeys.join(","),
    (newCsv, oldCsv) => {
        const newKeys = newCsv ? newCsv.split(",") : [];
        const oldKeys = oldCsv ? oldCsv.split(",") : [];
        const removedKeys = oldKeys.filter((k) => !newKeys.includes(k));
        const existingKeys = new Set(blockedRows.value.map(rowKey));
        const addedKeys = newKeys.filter((k) => !oldKeys.includes(k) && !existingKeys.has(k));

        if (removedKeys.length) {
            blockedRows.value = blockedRows.value.filter((r) => !removedKeys.includes(rowKey(r)));
        }

        if (addedKeys.length) {
            const addedRows = addedKeys.map((k) => {
                const [blocked_type, blocked_id] = k.split(":");
                return { blocked_type, blocked_id: Number(blocked_id) };
            });
            resolveUsers(addedRows.map((r) => ({ type: r.blocked_type, id: r.blocked_id })));
            blockedRows.value = [...addedRows, ...blockedRows.value];
        }
    },
);
</script>

<template>
    <div class="chat-blocked-contacts-panel flex h-full flex-col bg-riwaaq-surface">
        <SidebarScreenHeader title="Blocked contacts" @back="setView('chats')">
            <GlobalMenu />
        </SidebarScreenHeader>

        <div ref="scrollEl" class="chat-scroll flex-1 overflow-y-auto px-2 pb-5">
            <p v-if="!blockedRows.length && loading" class="px-3 py-4 text-sm text-riwaaq-textMuted">Loading&hellip;</p>
            <p v-else-if="!blockedRows.length" class="px-3 py-4 text-sm text-riwaaq-textMuted">
                No blocked contacts.
            </p>

            <div
                v-for="row in blockedRows"
                :key="`${row.blocked_type}:${row.blocked_id}`"
                class="flex items-center gap-3 rounded-chat px-3 py-2.5 hover:bg-riwaaq-surfaceHover"
            >
                <Avatar
                    :name="getUser({ type: row.blocked_type, id: row.blocked_id }).name"
                    :avatar-url="getUser({ type: row.blocked_type, id: row.blocked_id }).avatar_url"
                    :size="44"
                />
                <span class="min-w-0 flex-1 truncate text-[14px] font-semibold text-riwaaq-text">
                    {{ getUser({ type: row.blocked_type, id: row.blocked_id }).name }}
                </span>
                <button
                    type="button"
                    class="h-8 shrink-0 rounded-full border border-riwaaq-border px-3.5 text-xs font-semibold text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover disabled:opacity-50"
                    :disabled="unblockingKey === `${row.blocked_type}:${row.blocked_id}`"
                    @click="onUnblock(row)"
                >
                    Unblock
                </button>
            </div>

            <div v-if="page < lastPage" ref="sentinelEl" class="h-1" />
            <p v-if="blockedRows.length && loading" class="px-3 py-4 text-center text-sm text-riwaaq-textMuted">
                Loading&hellip;
            </p>
        </div>
    </div>
</template>
