<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
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

const menuOpen = ref(false);
const root = ref(null);

function onDocumentClick(event) {
    if (root.value && !root.value.contains(event.target)) {
        menuOpen.value = false;
    }
}

watch(menuOpen, (open) => {
    if (open) {
        document.addEventListener("click", onDocumentClick);
    } else {
        document.removeEventListener("click", onDocumentClick);
    }
});

onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick));

function toggleMute(event) {
    event.stopPropagation();
    menuOpen.value = false;
    mute(
        props.conversation.id,
        isMuted.value
            ? null
            : new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    );
}

function toggleFavourite(event) {
    event.stopPropagation();
    menuOpen.value = false;
    setFavourited(props.conversation.id, !isFavourited.value);
}

function togglePin(event) {
    event.stopPropagation();
    menuOpen.value = false;
    setPinned(props.conversation.id, !isPinned.value);
}
</script>

<template>
    <span ref="root" class="cv-conversation-row-actions relative flex shrink-0 items-center">
        <button
            type="button"
            title="Chat options"
            class="flex h-6 w-6 items-center justify-center rounded-full text-converse-textMuted opacity-0 transition-opacity hover:bg-converse-surfaceHover group-hover:opacity-100 group-focus-within:opacity-100"
            :class="{ 'opacity-100': menuOpen }"
            @click.stop="menuOpen = !menuOpen"
        >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
            </svg>
        </button>

        <div
            v-if="menuOpen"
            class="cv-animate-pop-in absolute right-0 top-full z-20 mt-1 w-52 rounded-[22px] border border-converse-border bg-converse-surface p-2 text-sm shadow-lg"
            @click.stop
        >
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="toggleMute"
            >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" class="shrink-0 text-converse-textMuted"><path d="M18 16v-5a6 6 0 0 0-4.6-5.8M6 11v5l-2 2h13" /><path d="M3 3l18 18" /></svg>
                <span>{{ isMuted ? "Unmute" : "Mute" }}</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="toggleFavourite"
            >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-converse-textMuted"><path d="M12 20s-7-4.4-7-9a3.9 3.9 0 0 1 7-2.4A3.9 3.9 0 0 1 19 11c0 4.6-7 9-7 9Z" /></svg>
                <span>{{ isFavourited ? "Remove from favourites" : "Add to favourites" }}</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="togglePin"
            >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-converse-textMuted"><path d="M8 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0ZM12 13v8" /></svg>
                <span>{{ isPinned ? "Unpin" : "Pin" }}</span>
            </button>
        </div>
    </span>
</template>
