<script setup>
import { computed } from 'vue';
import { useConversations } from '../../composables/useConversations';

const props = defineProps({
    conversation: { type: Object, required: true },
});

const { setDisappearing } = useConversations();

const OPTIONS = [
    { label: 'Off', value: '' },
    { label: '24 hours', value: 86400 },
    { label: '7 days', value: 604800 },
    { label: '90 days', value: 7776000 },
];

const current = computed(() => props.conversation.disappearing_messages_ttl ?? '');

function onChange(event) {
    const value = event.target.value;
    setDisappearing(props.conversation.id, value === '' ? null : Number(value));
}
</script>

<template>
    <div class="cv-disappearing-toggle">
        <label class="mb-1 block text-xs font-medium text-converse-textMuted">Disappearing messages</label>
        <select
            :value="current"
            class="w-full rounded border border-converse-border px-2 py-1.5 text-sm"
            @change="onChange"
        >
            <option v-for="option in OPTIONS" :key="option.label" :value="option.value">{{ option.label }}</option>
        </select>
    </div>
</template>
