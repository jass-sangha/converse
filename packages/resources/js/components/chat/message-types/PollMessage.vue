<script setup>
import { computed } from 'vue';
import { useMessages } from '../../../composables/useMessages';

const props = defineProps({
    message: { type: Object, required: true },
});

const { votePoll } = useMessages();

const question = computed(() => props.message.metadata?.question ?? '');
const labels = computed(() => props.message.metadata?.options ?? []);
const multiple = computed(() => !!props.message.metadata?.multiple);
const tally = computed(() => props.message.poll ?? { options: [], total_voters: 0 });
const totalVoters = computed(() => tally.value.total_voters ?? 0);

function optionAt(index) {
    return tally.value.options?.find((o) => o.index === index) ?? { count: 0, self: false, voters: [] };
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
    <div class="cv-poll-message min-w-[240px] max-w-sm rounded border border-converse-border bg-converse-surface p-3">
        <div class="mb-2 flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="shrink-0 text-converse-textMuted"><path d="M4 4h2v16H4Zm14 6h2v10h-2Zm-7-3h2v13h-2Z"/></svg>
            <p class="text-sm font-medium text-converse-text">{{ question }}</p>
        </div>

        <div class="flex flex-col gap-2">
            <button
                v-for="(label, index) in labels"
                :key="index"
                type="button"
                class="cv-poll-message__option relative w-full overflow-hidden rounded-cv border border-converse-border p-2 text-left"
                :class="optionAt(index).self ? 'border-converse-accent' : ''"
                @click="onVote(index)"
            >
                <span
                    class="absolute inset-y-0 left-0 bg-converse-accent/15"
                    :style="{ width: percentage(index) + '%' }"
                />
                <span class="relative flex items-center justify-between gap-2">
                    <span class="flex items-center gap-2 text-sm text-converse-text">
                        <svg v-if="optionAt(index).self" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="shrink-0 text-converse-accent"><path d="m9 16.2-3.5-3.6L4 14.1l5 5 11-11-1.4-1.4Z"/></svg>
                        {{ label }}
                    </span>
                    <span class="shrink-0 text-xs text-converse-textMuted">{{ percentage(index) }}%</span>
                </span>
            </button>
        </div>

        <p class="mt-2 text-xs text-converse-textMuted">
            {{ totalVoters }} {{ totalVoters === 1 ? 'vote' : 'votes' }}<span v-if="multiple"> · Select one or more</span>
        </p>
    </div>
</template>
