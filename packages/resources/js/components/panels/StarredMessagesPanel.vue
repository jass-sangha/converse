<script setup>
import { onMounted, ref } from 'vue';
import MessageBubble from '../chat/MessageBubble.vue';
import SidebarScreenHeader from '../shared/SidebarScreenHeader.vue';
import GlobalMenu from '../shared/GlobalMenu.vue';
import { useApi } from '../../composables/useApi';
import { useConversations } from '../../composables/useConversations';
import { useUsers } from '../../composables/useUsers';
import { useSidebarUi } from '../../composables/useSidebarUi';
import { useChatStore } from '../../store';
import { chatableKeyOf, chatableKey } from '../../chatable';

const { setView } = useSidebarUi();
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

    const others = data.data
        .map((message) => otherParticipant(message))
        .filter((ref) => ref !== null);

    if (others.length) {
        const unique = [...new Map(others.map((r) => [chatableKey(r.type, r.id), r])).values()];
        await resolve(unique);
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

function otherParticipant(message) {
    if (!message.conversation || message.conversation.type !== 'private') return null;
    const other = (message.conversation.participants ?? []).find((p) => chatableKeyOf(p) !== store.currentKey);
    return other ? { type: other.chatable_type, id: other.chatable_id } : null;
}

function conversationLabel(message) {
    if (!message.conversation) return '';
    if (message.conversation.type === 'group') return message.conversation.name || 'Group';
    const other = otherParticipant(message);
    return other ? get(other).name : 'Unknown';
}

function jumpTo(message) {
    setActive(message.conversation_id);
    setView('chats');
}

function onStarChanged(message) {
    if (!message.is_starred_by_me) {
        messages.value = messages.value.filter((m) => m.id !== message.id);
    }
}
</script>

<template>
    <div class="cv-starred-messages-panel flex h-full flex-col bg-converse-surface">
        <SidebarScreenHeader title="Starred messages" @back="setView('chats')">
            <GlobalMenu />
        </SidebarScreenHeader>

        <div class="flex-1 overflow-y-auto p-4">
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
        </div>
    </div>
</template>
