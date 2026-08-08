<script setup>
import { onMounted, onUnmounted } from 'vue';
import AppShell from './components/layout/AppShell.vue';
import { useChatStore } from './store';
import { useEcho } from './composables/useEcho';
import { usePresence } from './composables/usePresence';
import { useProfile } from './composables/useProfile';

const store = useChatStore();
const config = window.ConverseConfig ?? {};

store.currentUserId = config.userId ?? null;

const presence = usePresence();

onMounted(() => {
    useEcho();
    presence.start();
    useProfile().ensureSelfCached();
});

onUnmounted(() => {
    presence.stop();
});
</script>

<template>
    <AppShell />
</template>
