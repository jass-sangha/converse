<script setup>
import { useChatStore } from '../../store';
import { chatableKey } from '../../chatable';

defineProps({
    reactions: { type: Array, default: () => [] },
    showCount: { type: Boolean, default: true },
});

const emit = defineEmits(['open']);

const store = useChatStore();

// A reaction's `self` flag can't be trusted from the API here: the reaction toggle's HTTP
// response is the same payload broadcast to every other participant, and "self" can't be scoped
// per-recipient in a single shared payload — so it's missing entirely rather than wrong for
// someone. Only a full reload (via MessageResource, which *does* know the viewer) had it, which
// is why the highlight used to only appear after a refresh. Derived locally from the objective
// `chatables` list instead — same fix already applied to poll/event tallies, same reason.
function isSelf(reaction) {
    return (reaction.chatables ?? []).some((c) => chatableKey(c.type, c.id) === store.currentKey);
}
</script>

<template>
    <div v-if="reactions.length" class="cv-reaction-pills flex flex-wrap gap-1">
        <button
            v-for="reaction in reactions"
            :key="reaction.emoji"
            type="button"
            class="cv-reaction-pills__pill flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs shadow-sm"
            :class="isSelf(reaction) ? 'border-converse-accent bg-converse-bubbleOut' : 'border-converse-border bg-converse-surface'"
            @click.stop="emit('open')"
        >
            <span>{{ reaction.emoji }}</span>
            <span v-if="showCount">{{ reaction.count }}</span>
        </button>
    </div>
</template>
