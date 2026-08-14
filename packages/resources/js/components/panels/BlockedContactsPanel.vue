<script setup>
import { onMounted, ref } from "vue";
import Avatar from "../shared/Avatar.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import { useBlockedUsers } from "../../composables/useBlockedUsers";
import { useUsers } from "../../composables/useUsers";
import { useSidebarUi } from "../../composables/useSidebarUi";

const { setView } = useSidebarUi();
const { list: listBlocked, unblock } = useBlockedUsers();
const { resolve: resolveUsers, get: getUser } = useUsers();

const blockedRows = ref([]);
const loading = ref(true);
const unblockingKey = ref(null);

async function refresh() {
    loading.value = true;
    const rows = await listBlocked();
    blockedRows.value = rows;
    await resolveUsers(
        rows.map((r) => ({ type: r.blocked_type, id: r.blocked_id })),
    );
    loading.value = false;
}

onMounted(refresh);

async function onUnblock(row) {
    const key = `${row.blocked_type}:${row.blocked_id}`;
    unblockingKey.value = key;
    try {
        await unblock(row.blocked_type, row.blocked_id);
        blockedRows.value = blockedRows.value.filter((r) => r !== row);
    } finally {
        unblockingKey.value = null;
    }
}
</script>

<template>
    <div class="cv-blocked-contacts-panel flex h-full flex-col bg-converse-surface">
        <SidebarScreenHeader title="Blocked contacts" @back="setView('profile')">
            <GlobalMenu />
        </SidebarScreenHeader>

        <div class="cv-scroll flex-1 overflow-y-auto px-2 pb-5">
            <p v-if="loading" class="px-3 py-4 text-sm text-converse-textMuted">Loading&hellip;</p>
            <p v-else-if="!blockedRows.length" class="px-3 py-4 text-sm text-converse-textMuted">
                No blocked contacts.
            </p>

            <div
                v-for="row in blockedRows"
                :key="`${row.blocked_type}:${row.blocked_id}`"
                class="flex items-center gap-3 rounded-[20px] px-3 py-2.5 hover:bg-converse-surfaceHover"
            >
                <Avatar
                    :name="getUser({ type: row.blocked_type, id: row.blocked_id }).name"
                    :avatar-url="getUser({ type: row.blocked_type, id: row.blocked_id }).avatar_url"
                    :size="44"
                />
                <span class="min-w-0 flex-1 truncate text-[14px] font-semibold text-converse-text">
                    {{ getUser({ type: row.blocked_type, id: row.blocked_id }).name }}
                </span>
                <button
                    type="button"
                    class="h-8 shrink-0 rounded-full border border-converse-border px-3.5 text-xs font-semibold text-converse-textMuted hover:bg-converse-surfaceHover disabled:opacity-50"
                    :disabled="unblockingKey === `${row.blocked_type}:${row.blocked_id}`"
                    @click="onUnblock(row)"
                >
                    Unblock
                </button>
            </div>
        </div>
    </div>
</template>
