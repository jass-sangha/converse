<script setup>
import { computed } from 'vue';
import IconRail from './IconRail.vue';
import MobileTabBar from './MobileTabBar.vue';
import ConversationList from '../sidebar/ConversationList.vue';
import CreateListPanel from '../sidebar/CreateListPanel.vue';
import MediaPanel from '../panels/MediaPanel.vue';
import SettingsPanel from '../panels/SettingsPanel.vue';
import ProfileEmptyState from '../panels/ProfileEmptyState.vue';
import ChatWindow from '../chat/ChatWindow.vue';
import { useChatStore } from '../../store';
import { usePreferences } from '../../composables/usePreferences';
import { useResizable } from '../../composables/useResizable';
import { useSidebarUi } from '../../composables/useSidebarUi';
import { useCall } from '../../composables/useCall';

const store = useChatStore();

const { sidebarWidth } = usePreferences();
const { startDrag } = useResizable(sidebarWidth, { invert: false });
const { view } = useSidebarUi();
const { isActive: callIsActive } = useCall();

const showMobileTabBar = computed(() => !store.activeConversationId && !callIsActive.value);
</script>

<template>
    <div class="cv-app-shell flex h-screen w-screen flex-col overflow-hidden text-converse-text">
        <div class="flex min-h-0 flex-1">
            <!-- Icon rail is desktop-only — mobile navigates via the bottom tab bar. -->
            <div class="cv-app-shell__rail-wrap hidden shrink-0 sm:block">
                <IconRail />
            </div>

            <!-- Mobile: show sidebar only when no conversation is active. Desktop: always show both. -->
            <div
                class="cv-app-shell__sidebar relative w-full border-r border-converse-border sm:w-[var(--sidebar-width)] sm:shrink-0"
                :class="{ hidden: store.activeConversationId, 'sm:block': true }"
                :style="{ '--sidebar-width': sidebarWidth + 'px' }"
            >
                <ConversationList v-if="view === 'chats'" />
                <MediaPanel v-else-if="view === 'media'" />
                <CreateListPanel v-else-if="view === 'create-list'" />
                <SettingsPanel v-else />
                <div class="cv-app-shell__sidebar-resize-handle absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-col-resize sm:block" @pointerdown="startDrag" />
            </div>

            <div
                class="cv-app-shell__main flex-1"
                :class="{ hidden: !store.activeConversationId, 'sm:block': true }"
            >
                <ProfileEmptyState v-if="view === 'profile'" />
                <ChatWindow v-else />
            </div>
        </div>

        <MobileTabBar v-if="showMobileTabBar" />
    </div>
</template>
