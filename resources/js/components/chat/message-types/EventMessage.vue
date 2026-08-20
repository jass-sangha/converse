<script setup>
import { computed } from "vue";
import Icon from "../../shared/Icon.vue";
import { useMessages } from "../../../composables/useMessages";
import { useChatStore } from "../../../store";
import { chatableKey } from "../../../chatable";

const props = defineProps({
    message: { type: Object, required: true },
});

const { respondToEvent } = useMessages();
const store = useChatStore();

const RSVP_OPTIONS = [
    { key: "going", label: "Going" },
    { key: "maybe", label: "Maybe" },
    { key: "declined", label: "Can't go" },
];

const title = computed(() => props.message.metadata?.title ?? "");
const location = computed(() => props.message.metadata?.location ?? null);
const locationLat = computed(
    () => props.message.metadata?.location_lat ?? null,
);
const locationLng = computed(
    () => props.message.metadata?.location_lng ?? null,
);
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
        if (
            respondents.some(
                (r) => chatableKey(r.type, r.id) === store.currentKey,
            )
        ) {
            return option.key;
        }
    }
    return null;
});

const formattedStartsAt = computed(() => {
    const raw = props.message.metadata?.starts_at;
    if (!raw) return "";
    const date = new Date(raw);
    return date.toLocaleString([], {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    });
});

function countFor(status) {
    return tally.value[status]?.count ?? 0;
}

async function onRespond(status) {
    await respondToEvent(
        props.message.id,
        props.message.conversation_id,
        myStatus.value === status ? null : status,
    );
}
</script>

<template>
    <div
        class="chat-event-message min-w-0 max-w-sm rounded-2xl border border-riwaaq-border bg-riwaaq-surface p-3"
    >
        <div class="mb-2 flex items-center gap-2">
            <Icon name="calendar" :size="18" class="shrink-0 text-riwaaq-textMuted" />
            <p class="text-sm font-medium text-riwaaq-text">{{ title }}</p>
        </div>

        <p class="text-xs text-riwaaq-textMuted">{{ formattedStartsAt }}</p>
        <p v-if="location" class="text-xs text-riwaaq-textMuted">
            📍 {{ location }}
            <a
                v-if="mapUrl"
                :href="mapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-1 font-medium text-riwaaq-accentText hover:underline"
                @click.stop
                >View map</a
            >
        </p>
        <p
            v-if="description"
            class="mt-1 whitespace-pre-wrap text-sm text-riwaaq-text"
        >
            {{ description }}
        </p>

        <!-- RSVP options disabled for now, kept for future use: v-if="false" here (not an HTML
        comment) survives formatting tools that otherwise strip comment delimiters around
        directive-bearing markup and leave the content live. -->
        <div v-if="false" class="mt-3 flex flex-col gap-2">
            <button
                v-for="option in RSVP_OPTIONS"
                :key="option.key"
                type="button"
                class="flex w-full items-center justify-between rounded-chat border px-3 py-1.5 text-left text-xs"
                :class="
                    myStatus === option.key
                        ? 'border-riwaaq-accent bg-riwaaq-accent/15 text-riwaaq-accent'
                        : 'border-riwaaq-border text-riwaaq-text hover:bg-riwaaq-surfaceHover'
                "
                @click="onRespond(option.key)"
            >
                <span>{{ option.label }}</span>
                <span class="text-[10px] text-riwaaq-textMuted">{{
                    countFor(option.key)
                }}</span>
            </button>
        </div>
    </div>
</template>
