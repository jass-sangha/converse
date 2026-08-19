<script setup>
import { computed } from "vue";
import IconRail from "./IconRail.vue";
import MobileTabBar from "./MobileTabBar.vue";
import ConversationList from "../sidebar/ConversationList.vue";
import NewChatPanel from "../sidebar/NewChatPanel.vue";
import NewGroupPanel from "../sidebar/NewGroupPanel.vue";
import MediaPanel from "../panels/MediaPanel.vue";
import SettingsPanel from "../panels/SettingsPanel.vue";
import StarredMessagesPanel from "../panels/StarredMessagesPanel.vue";
import BlockedContactsPanel from "../panels/BlockedContactsPanel.vue";
import ProfileEmptyState from "../panels/ProfileEmptyState.vue";
import ChatWindow from "../chat/ChatWindow.vue";
import { useChatStore } from "../../store";
import { usePreferences } from "../../composables/usePreferences";
import { useResizable } from "../../composables/useResizable";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { useCall } from "../../composables/useCall";
import { useEmbedMode } from "../../composables/useEmbedMode";

const store = useChatStore();

const { sidebarWidth } = usePreferences();
const { startDrag } = useResizable(sidebarWidth, { invert: false });
const { view } = useSidebarUi();
const { isActive: callIsActive } = useCall();
const { isEmbedded } = useEmbedMode();

const showMobileTabBar = computed(
    () => !store.activeConversationId && !callIsActive.value,
);
</script>

<template>
    <div
        class="chat-app-shell relative flex flex-col overflow-hidden bg-riwaaq-chatBg text-riwaaq-text"
        :class="isEmbedded ? 'h-full w-full' : 'h-screen w-screen'"
    >
        <div class="flex min-h-0 flex-1">
            <!-- Icon rail is desktop-only — mobile navigates via the bottom tab bar. -->
            <div class="chat-app-shell__rail-wrap hidden shrink-0 sm:block">
                <IconRail />
            </div>

            <!-- Mobile: the sidebar and main pane are single-pane — show the sidebar unless
                 we're specifically in the chats view with a conversation open. Desktop: always
                 show both, side by side. -->
            <div
                class="chat-app-shell__sidebar relative w-full border-r border-riwaaq-border sm:w-[var(--sidebar-width)] sm:shrink-0"
                :class="{
                    hidden: view === 'chats' && store.activeConversationId,
                    'sm:block': true,
                }"
                :style="{ '--sidebar-width': sidebarWidth + 'px' }"
            >
                <ConversationList
                    v-if="view === 'chats' || view === 'archived'"
                />
                <NewChatPanel v-else-if="view === 'new-chat'" />
                <NewGroupPanel v-else-if="view === 'new-group'" />
                <MediaPanel v-else-if="view === 'media'" />
                <StarredMessagesPanel v-else-if="view === 'starred'" />
                <BlockedContactsPanel v-else-if="view === 'blocked'" />
                <SettingsPanel v-else />
                <div
                    class="chat-app-shell__sidebar-resize-handle absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-col-resize sm:block"
                    @pointerdown="startDrag"
                />
            </div>

            <div
                class="chat-app-shell__main min-w-0 flex-1"
                :class="{
                    hidden: !(view === 'chats' && store.activeConversationId),
                    'sm:block': true,
                }"
            >
                <ProfileEmptyState
                    v-if="view === 'profile' && !store.activeConversationId"
                />
                <ChatWindow v-else />
            </div>
        </div>

        <MobileTabBar v-if="showMobileTabBar" />
    </div>
</template>
