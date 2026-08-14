<script setup>
import { onMounted, ref } from "vue";
import Avatar from "../shared/Avatar.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import { useApi } from "../../composables/useApi";
import { useConversations } from "../../composables/useConversations";
import { useMessages } from "../../composables/useMessages";
import { useUsers } from "../../composables/useUsers";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { chatableKey } from "../../chatable";

const { setView } = useSidebarUi();
const api = useApi();
const { setActive } = useConversations();
const { unstar } = useMessages();
const { resolve, get } = useUsers();

const messages = ref([]);
const loading = ref(true);
const page = ref(1);
const hasMore = ref(false);

async function loadPage(pageNumber) {
    const { data } = await api.get("/starred-messages", {
        params: { page: pageNumber },
    });

    const senders = data.data.map((message) => ({
        type: message.chatable_type,
        id: message.chatable_id,
    }));

    if (senders.length) {
        const unique = [
            ...new Map(
                senders.map((r) => [chatableKey(r.type, r.id), r]),
            ).values(),
        ];
        await resolve(unique);
    }

    if (pageNumber === 1) {
        messages.value = data.data;
    } else {
        messages.value = [...messages.value, ...data.data];
    }

    page.value = data.meta?.current_page ?? pageNumber;
    hasMore.value =
        (data.meta?.current_page ?? pageNumber) <
        (data.meta?.last_page ?? pageNumber);
}

onMounted(async () => {
    await loadPage(1);
    loading.value = false;
});

async function loadMore() {
    await loadPage(page.value + 1);
}

function sender(message) {
    return get({ type: message.chatable_type, id: message.chatable_id });
}

function conversationLabel(message) {
    if (!message.conversation) return "";
    return message.conversation.type === "group"
        ? message.conversation.name || "Group"
        : sender(message).name;
}

function snippet(message) {
    if (message.deleted_for_everyone) return "This message was deleted";
    return message.type === "text" ? message.body : `[${message.type}]`;
}

function jumpTo(message) {
    setActive(message.conversation_id);
    setView("chats");
}

async function onUnstar(message) {
    await unstar(message.id);
    messages.value = messages.value.filter((m) => m.id !== message.id);
}
</script>

<template>
    <div class="cv-starred-messages-panel flex h-full flex-col bg-converse-surface">
        <SidebarScreenHeader title="Starred messages" @back="setView('chats')">
            <GlobalMenu />
        </SidebarScreenHeader>

        <div class="cv-scroll flex-1 overflow-y-auto px-2 pb-5">
            <p v-if="loading" class="px-3 py-4 text-sm text-converse-textMuted">
                Loading&hellip;
            </p>
            <p
                v-else-if="!messages.length"
                class="px-3 py-4 text-sm text-converse-textMuted"
            >
                No starred messages yet.
            </p>

            <template v-else>
                <div
                    v-for="message in messages"
                    :key="message.id"
                    class="flex cursor-pointer items-center gap-3 rounded-[20px] px-3 py-2.5 hover:bg-converse-surfaceHover"
                    @click="jumpTo(message)"
                >
                    <Avatar
                        :name="sender(message).name"
                        :avatar-url="sender(message).avatar_url"
                        :size="44"
                    />
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-[14px] font-semibold text-converse-text">
                            {{ conversationLabel(message) }}
                        </p>
                        <p class="truncate text-xs text-converse-textMuted">
                            <span
                                v-if="message.conversation?.type === 'group'"
                                >{{ sender(message).name }}: </span
                            >{{ snippet(message) }}
                        </p>
                    </div>
                    <div class="flex shrink-0 flex-col items-end gap-1.5">
                        <span class="text-[11px] text-converse-textMuted">{{
                            new Date(message.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                        }}</span>
                        <button
                            type="button"
                            title="Unstar"
                            class="flex h-6 w-6 items-center justify-center rounded-full text-converse-accent hover:bg-converse-surface"
                            @click.stop="onUnstar(message)"
                        >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                                <path
                                    d="M12 2 15 9l7 .6-5.3 4.6L18.2 21 12 17.3 5.8 21l1.5-6.8L2 9.6 9 9Z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <button
                    v-if="hasMore"
                    type="button"
                    class="mx-auto mt-2 block rounded px-3 py-1.5 text-sm text-converse-accent hover:bg-converse-surfaceHover"
                    @click="loadMore"
                >
                    Load more
                </button>
            </template>
        </div>
    </div>
</template>
