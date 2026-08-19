<script setup>
import { computed, onMounted, ref } from 'vue';
import Avatar from '../shared/Avatar.vue';
import Modal from '../shared/Modal.vue';
import { useUsers } from '../../composables/useUsers';
import { useMessages } from '../../composables/useMessages';
import { useChatStore } from '../../store';
import { chatableKey } from '../../chatable';

const props = defineProps({
    message: { type: Object, required: true },
});

const emit = defineEmits(['close']);

const store = useChatStore();
const { resolve, get } = useUsers();
const { unreact } = useMessages();

const activeEmoji = ref('all');
const loading = ref(true);
const removing = ref(false);

const reactions = computed(() => props.message.reactions ?? []);
const totalCount = computed(() => reactions.value.reduce((sum, r) => sum + r.count, 0));
const rows = computed(() => reactions.value.flatMap((r) => (r.chatables ?? []).map((chatable) => ({ emoji: r.emoji, chatable }))));
const visibleRows = computed(() => (activeEmoji.value === 'all' ? rows.value : rows.value.filter((row) => row.emoji === activeEmoji.value)));
const myReaction = computed(() => reactions.value.find((r) => r.self));

onMounted(async () => {
    const refs = rows.value.map((row) => row.chatable);
    if (refs.length) {
        const unique = [...new Map(refs.map((c) => [chatableKey(c.type, c.id), c])).values()];
        await resolve(unique);
    }
    loading.value = false;
});

function displayName(chatable) {
    return chatableKey(chatable.type, chatable.id) === store.currentKey ? 'You' : get(chatable).name;
}

async function removeMyReaction() {
    removing.value = true;
    try {
        await unreact(props.message.id, props.message.conversation_id);
        emit('close');
    } finally {
        removing.value = false;
    }
}
</script>

<template>
    <Modal class="chat-reaction-details-modal" title="Reactions" @close="emit('close')">
        <div class="chat-reaction-details-modal__tabs mb-3 flex items-center gap-2 overflow-x-auto pb-1">
            <button
                type="button"
                class="shrink-0 rounded-full px-3 py-1 text-sm font-medium"
                :class="activeEmoji === 'all' ? 'bg-riwaaq-accent/15 text-riwaaq-accent' : 'bg-riwaaq-surfaceHover text-riwaaq-text'"
                @click="activeEmoji = 'all'"
            >
                All {{ totalCount }}
            </button>
            <button
                v-for="reaction in reactions"
                :key="reaction.emoji"
                type="button"
                class="shrink-0 rounded-full px-3 py-1 text-sm font-medium"
                :class="activeEmoji === reaction.emoji ? 'bg-riwaaq-accent/15 text-riwaaq-accent' : 'bg-riwaaq-surfaceHover text-riwaaq-text'"
                @click="activeEmoji = reaction.emoji"
            >
                {{ reaction.emoji }} {{ reaction.count }}
            </button>
        </div>

        <p v-if="loading" class="text-sm text-riwaaq-textMuted">Loading&hellip;</p>

        <ul v-else class="chat-reaction-details-modal__list flex flex-col gap-1">
            <li v-for="row in visibleRows" :key="`${row.emoji}-${row.chatable.type}-${row.chatable.id}`" class="flex items-center gap-3 py-1.5">
                <Avatar :name="get(row.chatable).name" :avatar-url="get(row.chatable).avatar_url" :size="36" />
                <span class="flex-1 truncate text-sm text-riwaaq-text">{{ displayName(row.chatable) }}</span>
                <span class="text-lg">{{ row.emoji }}</span>
            </li>
        </ul>

        <template v-if="myReaction" #footer>
            <button
                type="button"
                class="w-full rounded py-2 text-sm font-medium text-riwaaq-danger disabled:opacity-50"
                :disabled="removing"
                @click="removeMyReaction"
            >
                {{ removing ? 'Removing…' : 'Remove your reaction' }}
            </button>
        </template>
    </Modal>
</template>
