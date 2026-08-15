<script setup>
import { computed } from "vue";

const props = defineProps({
    reactions: { type: Array, default: () => [] },
    showCount: { type: Boolean, default: true },
});

const emit = defineEmits(["open"]);

const MAX_EMOJIS = 3;

const topEmojis = computed(() =>
    [...props.reactions]
        .sort((a, b) => b.count - a.count)
        .slice(0, MAX_EMOJIS)
        .map((reaction) => reaction.emoji),
);

const totalCount = computed(() =>
    props.reactions.reduce((sum, reaction) => sum + (reaction.count ?? 0), 0),
);
</script>

<template>
    <button
        v-if="reactions.length"
        type="button"
        class="cv-reaction-pills__pill flex items-center gap-1 rounded-full border border-converse-border bg-converse-surface px-2 py-0.5 text-xs shadow-sm"
        @click.stop="emit('open')"
    >
        <span v-for="emoji in topEmojis" :key="emoji">{{ emoji }}</span>
        <span v-if="showCount">{{ totalCount }}</span>
    </button>
</template>
