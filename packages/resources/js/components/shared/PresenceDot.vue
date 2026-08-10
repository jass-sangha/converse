<script setup>
import { computed } from 'vue';
import { useChatStore } from '../../store';

const props = defineProps({
    chatableKey: { type: String, required: true },
});

const store = useChatStore();

const presence = computed(() => store.presenceByUser[props.chatableKey]);

const lastSeenText = computed(() => {
    if (!presence.value) return null;
    if (presence.value.is_online) return 'online';
    if (!presence.value.last_seen_at) return null;

    const diffMs = Date.now() - new Date(presence.value.last_seen_at).getTime();
    const minutes = Math.round(diffMs / 60000);

    if (minutes < 1) return 'last seen just now';
    if (minutes < 60) return `last seen ${minutes}m ago`;

    const hours = Math.round(minutes / 60);
    if (hours < 24) return `last seen ${hours}h ago`;

    return `last seen ${Math.round(hours / 24)}d ago`;
});
</script>

<template>
    <span class="cv-presence-dot inline-flex items-center gap-1 text-[10px] text-converse-textMuted">
        <span
            v-if="presence?.is_online"
            class="cv-presence-dot__indicator h-1.5 w-1.5 rounded-full bg-converse-accent"
        />
        <span v-if="lastSeenText">{{ lastSeenText }}</span>
    </span>
</template>
