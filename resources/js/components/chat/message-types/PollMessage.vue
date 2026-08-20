<script setup>
import { computed } from 'vue';
import { useMessages } from '../../../composables/useMessages';
import { useChatStore } from '../../../store';
import { chatableKey } from '../../../chatable';
import Icon from '../../shared/Icon.vue';

const props = defineProps({
    message: { type: Object, required: true },
});

const { votePoll } = useMessages();
const store = useChatStore();

const question = computed(() => props.message.metadata?.question ?? '');
const labels = computed(() => props.message.metadata?.options ?? []);
const multiple = computed(() => !!props.message.metadata?.multiple);
const tally = computed(() => props.message.poll ?? { options: [], total_voters: 0 });
const totalVoters = computed(() => tally.value.total_voters ?? 0);

// `self` isn't trustworthy from the API here: the same tally payload is broadcast to every
// participant (it can't carry a field scoped to "whoever's looking"), so it's derived locally
// from the objective voters list instead — correct regardless of whether this tally came from
// the initial load, this viewer's own vote response, or someone else's realtime broadcast.
function optionAt(index) {
    const option = tally.value.options?.find((o) => o.index === index) ?? { count: 0, voters: [] };
    return {
        ...option,
        self: (option.voters ?? []).some((v) => chatableKey(v.type, v.id) === store.currentKey),
    };
}

function percentage(index) {
    if (!totalVoters.value) return 0;
    return Math.round((optionAt(index).count / totalVoters.value) * 100);
}

async function onVote(index) {
    await votePoll(props.message.id, props.message.conversation_id, index);
}
</script>

<template>
    <div class="chat-poll-message min-w-0 max-w-sm rounded-2xl border border-riwaaq-border bg-riwaaq-surface p-3">
        <div class="mb-2 flex items-center gap-2">
            <Icon name="poll" :size="18" class="shrink-0 text-riwaaq-textMuted" />
            <p class="text-sm font-medium text-riwaaq-text">{{ question }}</p>
        </div>

        <div class="flex flex-col gap-2">
            <button
                v-for="(label, index) in labels"
                :key="index"
                type="button"
                class="chat-poll-message__option relative w-full overflow-hidden rounded-chat border p-2 text-left"
                :class="optionAt(index).self
                    ? 'border-riwaaq-accent text-riwaaq-accent'
                    : 'border-riwaaq-border text-riwaaq-text hover:bg-riwaaq-surfaceHover'"
                @click="onVote(index)"
            >
                <span
                    class="absolute inset-y-0 left-0 bg-riwaaq-accent/15"
                    :style="{ width: percentage(index) + '%' }"
                />
                <span class="relative flex items-center justify-between gap-2">
                    <span class="flex items-center gap-2 text-sm">
                        <Icon v-if="optionAt(index).self" name="check" :size="14" class="shrink-0 text-riwaaq-accent" />
                        {{ label }}
                    </span>
                    <span class="shrink-0 text-xs text-riwaaq-textMuted">{{ percentage(index) }}%</span>
                </span>
            </button>
        </div>

        <p class="mt-2 text-xs text-riwaaq-textMuted">
            {{ totalVoters }} {{ totalVoters === 1 ? 'vote' : 'votes' }}<span v-if="multiple"> · Select one or more</span>
        </p>
    </div>
</template>
