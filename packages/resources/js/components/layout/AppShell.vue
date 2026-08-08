<script setup>
import { ref } from 'vue';
import ConversationList from '../sidebar/ConversationList.vue';
import ChatWindow from '../chat/ChatWindow.vue';
import SettingsPanel from '../panels/SettingsPanel.vue';
import { useChatStore } from '../../store';
import { usePreferences } from '../../composables/usePreferences';
import { useResizable } from '../../composables/useResizable';

const store = useChatStore();
const messageSearchQuery = ref('');
const showSettings = ref(false);

const { sidebarWidth } = usePreferences();
const { startDrag } = useResizable(sidebarWidth, { invert: false });

function onMessageSearch(query) {
    messageSearchQuery.value = query;
}
</script>

<template>
    <div class="cv-app-shell flex h-screen w-screen overflow-hidden text-converse-text">
        <!-- Mobile: show sidebar only when no conversation is active. Desktop: always show both. -->
        <div
            class="cv-app-shell__sidebar relative w-full border-r border-converse-border sm:w-[var(--sidebar-width)] sm:shrink-0"
            :class="{ hidden: store.activeConversationId, 'sm:block': true }"
            :style="{ '--sidebar-width': sidebarWidth + 'px' }"
        >
            <ConversationList @message-search="onMessageSearch" @open-settings="showSettings = true" />
            <div class="cv-app-shell__sidebar-resize-handle absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-col-resize sm:block" @pointerdown="startDrag" />
        </div>

        <div
            class="cv-app-shell__main flex-1"
            :class="{ hidden: !store.activeConversationId, 'sm:block': true }"
        >
            <ChatWindow :message-search-query="messageSearchQuery" />
        </div>

        <SettingsPanel v-if="showSettings" @close="showSettings = false" />
    </div>
</template>
