<script setup>
import { ref } from "vue";
import UserPicker from "../shared/UserPicker.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import { useConversations } from "../../composables/useConversations";
import { useSidebarUi } from "../../composables/useSidebarUi";

const { setView, setFilter } = useSidebarUi();
const selected = ref([]);
const { createPrivate, setActive } = useConversations();

async function start() {
    if (!selected.value.length) return;

    const conversation = await createPrivate(selected.value[0]);
    setActive(conversation.id);
    setFilter("all");
    setView("chats");
}
</script>

<template>
    <div class="cv-new-chat-panel flex h-full flex-col bg-converse-surface">
        <SidebarScreenHeader title="New chat" @back="setView('chats')">
            <GlobalMenu />
        </SidebarScreenHeader>

        <UserPicker v-model="selected" :multiple="false" class="min-h-0 flex-1" />

        <div class="border-t border-converse-border p-3">
            <button
                type="button"
                class="cv-new-chat-panel__submit w-full rounded-full bg-converse-accent py-2 text-sm font-semibold text-converse-accentContrast disabled:opacity-50"
                :disabled="!selected.length"
                @click="start"
            >
                Start chat
            </button>
        </div>
    </div>
</template>
