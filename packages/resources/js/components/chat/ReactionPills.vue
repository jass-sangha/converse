<script setup>
defineProps({
    reactions: { type: Array, default: () => [] },
});

const emit = defineEmits(['toggle']);
</script>

<template>
    <div v-if="reactions.length" class="cv-reaction-pills mt-1 flex flex-wrap gap-1">
        <button
            v-for="reaction in reactions"
            :key="reaction.emoji"
            type="button"
            class="cv-reaction-pills__pill flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs"
            :class="reaction.self ? 'border-converse-accent bg-converse-bubbleOut' : 'border-converse-border bg-converse-surface'"
            @click="emit('toggle', reaction.emoji)"
        >
            <span>{{ reaction.emoji }}</span>
            <span>{{ reaction.count }}</span>
        </button>
    </div>
</template>
