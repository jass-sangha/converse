<script setup>
defineProps({
    reactions: { type: Array, default: () => [] },
    showCount: { type: Boolean, default: true },
});

const emit = defineEmits(['open']);
</script>

<template>
    <div v-if="reactions.length" class="cv-reaction-pills flex flex-wrap gap-1">
        <button
            v-for="reaction in reactions"
            :key="reaction.emoji"
            type="button"
            class="cv-reaction-pills__pill flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs shadow-sm"
            :class="reaction.self ? 'border-converse-accent bg-converse-bubbleOut' : 'border-converse-border bg-converse-surface'"
            @click.stop="emit('open')"
        >
            <span>{{ reaction.emoji }}</span>
            <span v-if="showCount">{{ reaction.count }}</span>
        </button>
    </div>
</template>
