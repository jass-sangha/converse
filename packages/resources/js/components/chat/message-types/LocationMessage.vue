<script setup>
import { computed } from 'vue';

const props = defineProps({
    message: { type: Object, required: true },
});

const mapUrl = computed(() => {
    const { lat, lng } = props.message.metadata ?? {};
    return `https://maps.google.com/?q=${lat},${lng}`;
});
</script>

<template>
    <a
        :href="mapUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="cv-location-message flex items-center gap-2 rounded border border-converse-border bg-converse-surface p-2 hover:bg-converse-surfaceHover"
    >
        <span class="text-2xl">📍</span>
        <span class="cv-location-message__meta min-w-0">
            <span class="block truncate text-sm font-medium">{{ message.metadata?.name || 'Shared location' }}</span>
            <span v-if="message.metadata?.address" class="block truncate text-xs text-converse-textMuted">{{ message.metadata.address }}</span>
        </span>
    </a>
</template>
