<script setup>
import { computed, onMounted, ref } from 'vue';
import Modal from '../shared/Modal.vue';
import MessageBubble from '../chat/MessageBubble.vue';
import { useApi } from '../../composables/useApi';
import { useConversations } from '../../composables/useConversations';
import { useUsers } from '../../composables/useUsers';
import { useChatStore } from '../../store';

const emit = defineEmits(['close']);

const api = useApi();
const { setActive } = useConversations();
const { resolve, get } = useUsers();
const store = useChatStore();

const messages = ref([]);
const loading = ref(true);
const page = ref(1);
const hasMore = ref(false);

async function loadPage(pageNumber) {
    const { data } = await api.get('/starred-messages', { params: { page: pageNumber } });

    const otherIds = data.data
        .map((message) => otherParticipantId(message))
        .filter((id) => id !== null);

    if (otherIds.length) {
        await resolve([...new Set(otherIds)]);
    }

    if (pageNumber === 1) {
        messages.value = data.data;
    } else {
        messages.value = [...messages.value, ...data.data];
    }

    page.value = data.meta?.current_page ?? pageNumber;
    hasMore.value = (data.meta?.current_page ?? pageNumber) < (data.meta?.last_page ?? pageNumber);
}

onMounted(async () => {
    await loadPage(1);
    loading.value = false;
});

async function loadMore() {
    await loadPage(page.value + 1);
}

function otherParticipantId(message) {
    if (!message.conversation || message.conversation.type !== 'private') return null;
    const other = (message.conversation.participants ?? []).find((p) => p.user_id !== store.currentUserId);
    return other?.user_id ?? null;
}

function conversationLabel(message) {
    if (!message.conversation) return '';
    if (message.conversation.type === 'group') return message.conversation.name || 'Group';
    const otherId = otherParticipantId(message);
    return otherId ? get(otherId).name : 'Unknown';
}

function jumpTo(message) {
    setActive(message.conversation_id);
    emit('close');
}

function onStarChanged(message) {
    if (!message.is_starred_by_me) {
        messages.value = messages.value.filter((m) => m.id !== message.id);
    }
}
</script>

<template>
    <Modal class="cv-starred-messages-panel" title="Starred messages" @close="emit('close')">
        <p v-if="loading" class="text-sm text-converse-textMuted">Loading&hellip;</p>
        <p v-else-if="!messages.length" class="text-sm text-converse-textMuted">No starred messages yet.</p>

        <div v-else class="cv-starred-messages-panel__list flex flex-col gap-2">
            <div
                v-for="message in messages"
                :key="message.id"
                class="cv-starred-messages-panel__item rounded"
            >
                <p
                    class="cv-starred-messages-panel__conversation-label cursor-pointer px-1 text-xs text-converse-textMuted hover:underline"
                    @click="jumpTo(message)"
                >
                    in {{ conversationLabel(message) }}
                </p>
                <div class="cursor-pointer hover:bg-converse-surfaceHover" @click="jumpTo(message)">
                    <MessageBubble :message="message" @star-changed="onStarChanged" />
                </div>
            </div>

            <button
                v-if="hasMore"
                type="button"
                class="cv-starred-messages-panel__load-more mt-2 text-sm text-converse-accent"
                @click="loadMore"
            >
                Load more
            </button>
        </div>
    </Modal>
</template>
