<script setup>
import { computed } from 'vue';
import Icon from '../shared/Icon.vue';

const props = defineProps({
    status: { type: String, default: 'sent' },
});

const tickIconName = computed(() => {
    if (props.status === 'sending') return 'read-tick-sending';
    if (props.status === 'sent') return 'read-tick-sent';
    return 'read-tick-read';
});

const tickSize = computed(() => (props.status === 'sending' ? 13 : 15));
</script>

<template>
    <span class="chat-read-receipt-ticks ml-1 inline-flex shrink-0 items-center" :class="status === 'read' ? 'text-riwaaq-info' : 'text-riwaaq-tick'">
        <Icon :name="tickIconName" :size="tickSize" />
    </span>
</template>
