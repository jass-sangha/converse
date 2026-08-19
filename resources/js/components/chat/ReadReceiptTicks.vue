<script setup>
defineProps({
    status: { type: String, default: 'sent' },
});
</script>

<template>
    <span class="chat-read-receipt-ticks ml-1 inline-flex shrink-0 items-center" :class="status === 'read' ? 'text-riwaaq-info' : 'text-riwaaq-tick'">
        <svg v-if="status === 'sending'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
        </svg>
        <svg v-else-if="status === 'sent'" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 13l3.5 3.5L20 8" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 13l3.5 3.5L12 10" />
            <path d="M9 13l3.5 3.5L20 8" />
        </svg>
    </span>
</template>
