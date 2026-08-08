<script setup>
import { onMounted, ref } from 'vue';
import Modal from '../shared/Modal.vue';
import Avatar from '../shared/Avatar.vue';
import UserPicker from '../shared/UserPicker.vue';
import { useBlockedUsers } from '../../composables/useBlockedUsers';
import { useUsers } from '../../composables/useUsers';

const emit = defineEmits(['close']);

const { list, block, unblock } = useBlockedUsers();
const { resolve, get } = useUsers();

const blocked = ref([]);
const showAdd = ref(false);
const picked = ref([]);
const loading = ref(true);

async function refresh() {
    loading.value = true;
    const rows = await list();
    blocked.value = rows;
    await resolve(rows.map((r) => ({ type: r.blocked_type, id: r.blocked_id })));
    loading.value = false;
}

onMounted(refresh);

async function addBlock() {
    if (!picked.value.length) return;
    await block(picked.value[0]);
    picked.value = [];
    showAdd.value = false;
    await refresh();
}

async function removeBlock(row) {
    await unblock(row.blocked_type, row.blocked_id);
    await refresh();
}
</script>

<template>
    <Modal class="cv-blocked-users-panel" title="Blocked users" @close="emit('close')">
        <button type="button" class="mb-3 text-sm text-converse-accent" @click="showAdd = !showAdd">
            {{ showAdd ? 'Cancel' : '+ Block someone' }}
        </button>

        <div v-if="showAdd" class="cv-blocked-users-panel__add-form mb-3">
            <UserPicker v-model="picked" :multiple="false" />
            <button
                type="button"
                class="mt-2 w-full rounded bg-converse-danger py-1.5 text-sm text-white disabled:opacity-50"
                :disabled="!picked.length"
                @click="addBlock"
            >
                Block
            </button>
        </div>

        <p v-if="loading" class="text-sm text-converse-textMuted">Loading&hellip;</p>
        <p v-else-if="!blocked.length" class="text-sm text-converse-textMuted">No blocked users.</p>

        <ul v-else class="cv-blocked-users-panel__list">
            <li v-for="row in blocked" :key="row.id" class="cv-blocked-users-panel__row flex items-center gap-2 py-1.5">
                <Avatar :name="get({ type: row.blocked_type, id: row.blocked_id }).name" :avatar-url="get({ type: row.blocked_type, id: row.blocked_id }).avatar_url" :size="32" />
                <span class="flex-1 text-sm">{{ get({ type: row.blocked_type, id: row.blocked_id }).name }}</span>
                <button type="button" class="text-xs text-converse-accent" @click="removeBlock(row)">Unblock</button>
            </li>
        </ul>
    </Modal>
</template>
