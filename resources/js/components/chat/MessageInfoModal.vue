<script setup>
import { computed, onMounted, ref } from 'vue';
import Avatar from '../shared/Avatar.vue';
import Modal from '../shared/Modal.vue';
import { useUsers } from '../../composables/useUsers';
import { useChatStore } from '../../store';
import { chatableKey } from '../../chatable';

const props = defineProps({
    message: { type: Object, required: true },
});

const emit = defineEmits(['close']);

const store = useChatStore();
const { resolve, get } = useUsers();

const loading = ref(true);

const details = computed(() => props.message.receipt_details ?? []);
const readRows = computed(() => details.value
    .filter((d) => d.read_at)
    .sort((a, b) => new Date(b.read_at) - new Date(a.read_at)));
const deliveredRows = computed(() => details.value
    .filter((d) => d.delivered_at && !d.read_at)
    .sort((a, b) => new Date(b.delivered_at) - new Date(a.delivered_at)));
const pendingRows = computed(() => details.value.filter((d) => !d.delivered_at));

const isGroup = computed(
    () => store.conversations.find((c) => c.id === props.message.conversation_id)?.type === 'group',
);

const isCall = computed(() => props.message.type === 'call');
const callParticipants = computed(() => props.message.metadata?.participants ?? []);

onMounted(async () => {
    const refs = isCall.value
        ? callParticipants.value.map((p) => ({ type: p.type, id: p.id }))
        : details.value.map((d) => ({ type: d.chatable_type, id: d.chatable_id }));
    if (refs.length) {
        const unique = [...new Map(refs.map((r) => [chatableKey(r.type, r.id), r])).values()];
        await resolve(unique);
    }
    loading.value = false;
});

function name(detail) {
    return get({ type: detail.chatable_type, id: detail.chatable_id }).name;
}

function avatarUrl(detail) {
    return get({ type: detail.chatable_type, id: detail.chatable_id }).avatar_url;
}

function formatTime(at) {
    return new Date(at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}
</script>

<template>
    <Modal class="chat-message-info-modal" title="Message info" @close="emit('close')">
        <p class="mb-3 text-xs text-riwaaq-textMuted">
            Sent {{ formatTime(message.created_at) }}
        </p>

        <p v-if="loading" class="text-sm text-riwaaq-textMuted">Loading&hellip;</p>

        <template v-else-if="isCall">
            <h3 class="mb-1 text-xs font-medium uppercase text-riwaaq-textMuted">
                Joined the call ({{ callParticipants.length }})
            </h3>
            <ul class="flex flex-col gap-1">
                <li v-for="p in callParticipants" :key="`${p.type}-${p.id}`" class="flex items-center gap-3 py-1">
                    <Avatar :name="get(p).name" :avatar-url="get(p).avatar_url" :size="36" />
                    <span class="min-w-0 flex-1 truncate text-sm text-riwaaq-text">{{ get(p).name }}</span>
                </li>
            </ul>
            <p v-if="!callParticipants.length" class="text-sm text-riwaaq-textMuted">No one else joined.</p>
        </template>

        <template v-else>
            <template v-if="isGroup">
                <div v-if="readRows.length" class="mb-3">
                    <h3 class="mb-1 flex items-center gap-1 text-xs font-medium uppercase text-riwaaq-textMuted">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="text-riwaaq-accent"><path d="M18 7 9.5 15.5 5 11l1.4-1.4 3.1 3.1L16.6 5.6Zm-5 0L8.5 11.5 5 8l1.4-1.4L8.5 8.7l3.1-3.1Z"/></svg>
                        Read by
                    </h3>
                    <ul class="flex flex-col gap-1">
                        <li v-for="row in readRows" :key="`read-${row.chatable_type}-${row.chatable_id}`" class="flex items-center gap-3 py-1">
                            <Avatar :name="name(row)" :avatar-url="avatarUrl(row)" :size="36" />
                            <span class="min-w-0 flex-1 truncate text-sm text-riwaaq-text">{{ name(row) }}</span>
                            <span class="shrink-0 text-xs text-riwaaq-textMuted">{{ formatTime(row.read_at) }}</span>
                        </li>
                    </ul>
                </div>

                <div v-if="deliveredRows.length" class="mb-3">
                    <h3 class="mb-1 flex items-center gap-1 text-xs font-medium uppercase text-riwaaq-textMuted">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18 7 9.5 15.5 5 11l1.4-1.4 3.1 3.1L16.6 5.6Zm-5 0L8.5 11.5 5 8l1.4-1.4L8.5 8.7l3.1-3.1Z"/></svg>
                        Delivered to
                    </h3>
                    <ul class="flex flex-col gap-1">
                        <li v-for="row in deliveredRows" :key="`delivered-${row.chatable_type}-${row.chatable_id}`" class="flex items-center gap-3 py-1">
                            <Avatar :name="name(row)" :avatar-url="avatarUrl(row)" :size="36" />
                            <span class="min-w-0 flex-1 truncate text-sm text-riwaaq-text">{{ name(row) }}</span>
                            <span class="shrink-0 text-xs text-riwaaq-textMuted">{{ formatTime(row.delivered_at) }}</span>
                        </li>
                    </ul>
                </div>

                <div v-if="pendingRows.length">
                    <h3 class="mb-1 text-xs font-medium uppercase text-riwaaq-textMuted">Pending</h3>
                    <ul class="flex flex-col gap-1">
                        <li v-for="row in pendingRows" :key="`pending-${row.chatable_type}-${row.chatable_id}`" class="flex items-center gap-3 py-1">
                            <Avatar :name="name(row)" :avatar-url="avatarUrl(row)" :size="36" />
                            <span class="min-w-0 flex-1 truncate text-sm text-riwaaq-text">{{ name(row) }}</span>
                        </li>
                    </ul>
                </div>

                <p v-if="!details.length" class="text-sm text-riwaaq-textMuted">No other participants yet.</p>
            </template>

            <template v-else>
                <p v-if="readRows.length" class="flex items-center justify-between py-1 text-sm">
                    <span class="text-riwaaq-text">Read</span>
                    <span class="text-riwaaq-textMuted">{{ formatTime(readRows[0].read_at) }}</span>
                </p>
                <p v-if="deliveredRows.length || readRows.length" class="flex items-center justify-between py-1 text-sm">
                    <span class="text-riwaaq-text">Delivered</span>
                    <span class="text-riwaaq-textMuted">{{ formatTime((deliveredRows[0] ?? readRows[0])?.delivered_at ?? readRows[0]?.read_at) }}</span>
                </p>
                <p v-if="!details.length" class="text-sm text-riwaaq-textMuted">Not delivered yet.</p>
            </template>
        </template>
    </Modal>
</template>
