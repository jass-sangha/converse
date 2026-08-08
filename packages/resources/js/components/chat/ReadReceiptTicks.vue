<script setup>
defineProps({
    status: { type: String, default: 'sent' },
});
</script>

<template>
    <span class="cv-read-receipt-ticks ml-1 inline-block text-xs" :class="status === 'read' ? 'text-converse-info' : 'text-converse-textMuted'">
        <span v-if="status === 'sending'">🕓</span>
        <span v-else-if="status === 'sent'">✓</span>
        <span v-else>✓✓</span>
    </span>
</template>
