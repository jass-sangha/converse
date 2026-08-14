<script setup>
import { computed } from "vue";
import { useConversations } from "../../composables/useConversations";

const props = defineProps({
    conversation: { type: Object, required: true },
});

const { mute, setPinned, setFavourited } = useConversations();

const isPinned = computed(
    () => !!(props.conversation.pinned_at || props.conversation.me?.pinned_at),
);
const isFavourited = computed(
    () =>
        !!(
            props.conversation.favourited_at ||
            props.conversation.me?.favourited_at
        ),
);
const isMuted = computed(() => !!props.conversation.me?.muted_until);

function toggleMute(event) {
    event.stopPropagation();
    mute(
        props.conversation.id,
        isMuted.value
            ? null
            : new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    );
}

function toggleFavourite(event) {
    event.stopPropagation();
    setFavourited(props.conversation.id, !isFavourited.value);
}

function togglePin(event) {
    event.stopPropagation();
    setPinned(props.conversation.id, !isPinned.value);
}
</script>

<template>
    <span class="cv-conversation-row-actions flex items-center gap-0.5">
        <button
            type="button"
            :title="isMuted ? 'Unmute' : 'Mute'"
            class="flex items-center justify-center rounded-full transition-opacity"
            :class="
                isMuted
                    ? 'opacity-100'
                    : 'text-converse-textMuted opacity-0 hover:bg-converse-surfaceHover group-hover:opacity-100 group-focus-within:opacity-100'
            "
            @click="toggleMute"
        >
            <svg
                v-if="isMuted"
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                stroke-width="2.6"
                stroke-linecap="round"
            >
                <path d="M18 16v-5a6 6 0 0 0-4.6-5.8M6 11v5l-2 2h13" />
                <path d="M3 3l18 18" />
            </svg>
            <svg
                v-else
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                stroke-width="2.6"
                stroke-linecap="round"
            >
                <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16Z" />
            </svg>
        </button>
        <button
            type="button"
            :title="isFavourited ? 'Remove from favourites' : 'Favourite'"
            class="flex items-center justify-center rounded-full transition-opacity"
            :class="
                isFavourited
                    ? 'opacity-100'
                    : 'text-converse-textMuted opacity-0 hover:bg-converse-surfaceHover group-hover:opacity-100 group-focus-within:opacity-100'
            "
            @click="toggleFavourite"
        >
            <svg
                v-if="isFavourited"
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="currentColor"
            >
                <path
                    d="M12 20s-7-4.4-7-9a3.9 3.9 0 0 1 7-2.4A3.9 3.9 0 0 1 19 11c0 4.6-7 9-7 9Z"
                />
            </svg>
            <svg
                v-else
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                stroke-width="2.6"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path
                    d="M12 20s-7-4.4-7-9a3.9 3.9 0 0 1 7-2.4A3.9 3.9 0 0 1 19 11c0 4.6-7 9-7 9Z"
                />
            </svg>
        </button>
        <button
            type="button"
            :title="isPinned ? 'Unpin' : 'Pin'"
            class="flex items-center justify-center rounded-full transition-opacity"
            :class="
                isPinned
                    ? 'opacity-100'
                    : 'text-converse-textMuted opacity-0 hover:bg-converse-surfaceHover group-hover:opacity-100 group-focus-within:opacity-100'
            "
            @click="togglePin"
        >
            <svg
                v-if="isPinned"
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="currentColor"
            >
                <path d="M8 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0ZM8.6 13h6.8L12 21Z" />
            </svg>
            <svg
                v-else
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                stroke-width="2.6"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M8 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0ZM12 13v8" />
            </svg>
        </button>
    </span>
</template>
