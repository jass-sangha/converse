<script setup>
import { computed, watch } from "vue";
import IconRail from "./IconRail.vue";
import MobileTabBar from "./MobileTabBar.vue";
import ConversationList from "../sidebar/ConversationList.vue";
import MediaPanel from "../panels/MediaPanel.vue";
import SettingsPanel from "../panels/SettingsPanel.vue";
import GroupInfoPanel from "../panels/GroupInfoPanel.vue";
import StarredMessagesPanel from "../panels/StarredMessagesPanel.vue";
import ProfileEmptyState from "../panels/ProfileEmptyState.vue";
import ChatWindow from "../chat/ChatWindow.vue";
import { useChatStore } from "../../store";
import { usePreferences } from "../../composables/usePreferences";
import { useResizable } from "../../composables/useResizable";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { useCall } from "../../composables/useCall";

const store = useChatStore();

const { sidebarWidth } = usePreferences();
const { startDrag } = useResizable(sidebarWidth, { invert: false });
const { view, setView } = useSidebarUi();
const { isActive: callIsActive } = useCall();

const showMobileTabBar = computed(
    () => !store.activeConversationId && !callIsActive.value,
);

const activeConversation = computed(() =>
    store.conversations.find((c) => c.id === store.activeConversationId),
);

// Group info only makes sense for the conversation it was opened from — if the active
// conversation goes away (or changes) out from under it, fall back to the chat list.
watch(
    () => store.activeConversationId,
    () => {
        if (view.value === "info") setView("chats");
    },
);
</script>

<template>
    <div
        class="cv-app-shell flex h-screen w-screen flex-col overflow-hidden text-converse-text"
    >
        <div class="flex min-h-0 flex-1">
            <!-- Icon rail is desktop-only — mobile navigates via the bottom tab bar. -->
            <div class="cv-app-shell__rail-wrap hidden shrink-0 sm:block">
                <IconRail />
            </div>

            <!-- Mobile: the sidebar and main pane are single-pane — show the sidebar unless
                 we're specifically in the chats view with a conversation open. Desktop: always
                 show both, side by side. -->
            <div
                class="cv-app-shell__sidebar relative w-full border-r border-converse-border sm:w-[var(--sidebar-width)] sm:shrink-0"
                :class="{
                    hidden: view === 'chats' && store.activeConversationId,
                    'sm:block': true,
                }"
                :style="{ '--sidebar-width': sidebarWidth + 'px' }"
            >
                <ConversationList v-if="view === 'chats'" />
                <MediaPanel v-else-if="view === 'media'" />
                <StarredMessagesPanel v-else-if="view === 'starred'" />
                <GroupInfoPanel
                    v-else-if="view === 'info' && activeConversation"
                    :conversation="activeConversation"
                    @close="setView('chats')"
                />
                <SettingsPanel v-else />
                <div
                    class="cv-app-shell__sidebar-resize-handle absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-col-resize sm:block"
                    @pointerdown="startDrag"
                />
            </div>

            <div
                class="cv-app-shell__main flex-1"
                :class="{
                    hidden: !(view === 'chats' && store.activeConversationId),
                    'sm:block': true,
                }"
            >
                <ProfileEmptyState v-if="view === 'profile'" />
                <ChatWindow v-else />
            </div>
        </div>

        <MobileTabBar v-if="showMobileTabBar" />
    </div>
</template>
