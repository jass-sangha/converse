<script setup>
import { onMounted, onUnmounted } from 'vue';
import AppShell from './components/layout/AppShell.vue';
import { setCurrentChatable } from './store';
import { useEcho } from './composables/useEcho';
import { usePresence } from './composables/usePresence';
import { useProfile } from './composables/useProfile';

const config = window.ConverseConfig ?? {};

setCurrentChatable(config.chatableType ?? null, config.chatableId ?? null);

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
