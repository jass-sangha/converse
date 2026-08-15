<script setup>
import { computed } from 'vue';
import { useMessages } from '../../../composables/useMessages';
import { useChatStore } from '../../../store';
import { chatableKey } from '../../../chatable';

const props = defineProps({
    message: { type: Object, required: true },
    isOwn: { type: Boolean, default: false },
});

const { respondToEvent } = useMessages();
const store = useChatStore();

const RSVP_OPTIONS = [
    { key: 'going', label: 'Going' },
    { key: 'maybe', label: 'Maybe' },
    { key: 'declined', label: "Can't go" },
];

const title = computed(() => props.message.metadata?.title ?? '');
const location = computed(() => props.message.metadata?.location ?? null);
const locationLat = computed(() => props.message.metadata?.location_lat ?? null);
const locationLng = computed(() => props.message.metadata?.location_lng ?? null);
const mapUrl = computed(() => {
    if (locationLat.value === null || locationLng.value === null) return null;
    return `https://www.openstreetmap.org/?mlat=${locationLat.value}&mlon=${locationLng.value}#map=16/${locationLat.value}/${locationLng.value}`;
});
const description = computed(() => props.message.metadata?.description ?? null);
const tally = computed(() => props.message.event ?? {});

// Derived locally from respondent lists rather than trusted from `my_status` — that field is
// only meaningful on the initial per-viewer load, not on the same tally object this viewer's
// own RSVP response or a realtime broadcast from someone else carries. See PollMessage.vue for
// the same reasoning.
const myStatus = computed(() => {
    for (const option of RSVP_OPTIONS) {
        const respondents = tally.value[option.key]?.respondents ?? [];
        if (respondents.some((r) => chatableKey(r.type, r.id) === store.currentKey)) {
            return option.key;
        }
    }
    return null;
});

const formattedStartsAt = computed(() => {
    const raw = props.message.metadata?.starts_at;
    if (!raw) return '';
    const date = new Date(raw);
    return date.toLocaleString([], { weekday: 'short', day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' });
});

function countFor(status) {
    return tally.value[status]?.count ?? 0;
}

async function onRespond(status) {
    await respondToEvent(props.message.id, props.message.conversation_id, myStatus.value === status ? null : status);
}
</script>

<template>
    <div
        class="cv-event-message min-w-[240px] max-w-sm rounded-2xl p-3"
        :class="isOwn ? 'bg-[rgba(140,73,26,.09)]' : 'bg-converse-surfaceHover'"
    >
        <div class="mb-2 flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="shrink-0 text-converse-textMuted"><path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2Zm-2 8h14v10H5Z"/></svg>
            <p class="text-sm font-medium text-converse-text">{{ title }}</p>
        </div>

        <p class="text-xs text-converse-textMuted">{{ formattedStartsAt }}</p>
        <p v-if="location" class="text-xs text-converse-textMuted">
            📍 {{ location }}
            <a
                v-if="mapUrl"
                :href="mapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-1 font-medium text-converse-accentText hover:underline"
                @click.stop
            >View map</a>
        </p>
        <p v-if="description" class="mt-1 whitespace-pre-wrap text-sm text-converse-text">{{ description }}</p>

        <div class="mt-3 flex gap-2">
            <button
                v-for="option in RSVP_OPTIONS"
                :key="option.key"
                type="button"
                class="flex-1 rounded-cv border px-2 py-1.5 text-center text-xs"
                :class="myStatus === option.key
                    ? 'border-converse-accent bg-converse-accent/15 text-converse-accent'
                    : 'border-converse-border text-converse-text hover:bg-converse-surfaceHover'"
                @click="onRespond(option.key)"
            >
                {{ option.label }}
                <span class="block text-[10px] text-converse-textMuted">{{ countFor(option.key) }}</span>
            </button>
        </div>
    </div>
</template>
