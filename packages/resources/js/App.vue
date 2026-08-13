<script setup>
import { onMounted, onUnmounted } from 'vue';
import AppShell from './components/layout/AppShell.vue';
import CallOverlay from './components/call/CallOverlay.vue';
import MinimizedCallBar from './components/call/MinimizedCallBar.vue';
import Toast from './components/shared/Toast.vue';
import { setCurrentChatable } from './store';
import { useEcho } from './composables/useEcho';
import { usePresence } from './composables/usePresence';
import { useProfile } from './composables/useProfile';
import { useBlockedUsers } from './composables/useBlockedUsers';

const config = window.ConverseConfig ?? {};

setCurrentChatable(config.chatableType ?? null, config.chatableId ?? null);

const presence = usePresence();

onMounted(() => {
    useEcho();
    presence.start();
    useProfile().ensureSelfCached();
    useBlockedUsers().loadBlocked();
});

onUnmounted(() => {
    presence.stop();
});
</script>

<template>
    <AppShell />
    <CallOverlay />
    <MinimizedCallBar />
    <Toast />
</template>
