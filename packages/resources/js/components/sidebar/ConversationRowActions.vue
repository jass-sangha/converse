<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useConversations } from "../../composables/useConversations";
import { useDropdownPlacement } from "../../composables/useDropdownPlacement";
import { useExclusiveDropdown } from "../../composables/useExclusiveDropdown";

const props = defineProps({
    conversation: { type: Object, required: true },
});

const { mute, setPinned, setUnread, setFavourited, setArchived } = useConversations();

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
const isArchived = computed(() => !!props.conversation.me?.archived_at);
const isUnread = computed(() => (props.conversation.unread_count ?? 0) > 0);

const menuOpen = ref(false);
const root = ref(null);
const triggerEl = ref(null);
const { openUp, maxHeight, place } = useDropdownPlacement();
const { opened, closed } = useExclusiveDropdown();

function close() {
    menuOpen.value = false;
}

function onDocumentClick(event) {
    if (root.value && !root.value.contains(event.target)) {
        close();
    }
}

function toggleMenu() {
    if (!menuOpen.value) place(triggerEl.value, { preferredHeight: 220 });
    menuOpen.value = !menuOpen.value;
}

function openMenu() {
    if (menuOpen.value) return;
    place(triggerEl.value, { preferredHeight: 220 });
    menuOpen.value = true;
}

defineExpose({ openMenu });

watch(menuOpen, (open) => {
    if (open) {
        opened(close);
        document.addEventListener("click", onDocumentClick);
    } else {
        closed(close);
        document.removeEventListener("click", onDocumentClick);
    }
});

onBeforeUnmount(() => {
    closed(close);
    document.removeEventListener("click", onDocumentClick);
});

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

function toggleArchive(event) {
    event.stopPropagation();
    menuOpen.value = false;
    setArchived(props.conversation.id, !isArchived.value);
}

function toggleUnread(event) {
    event.stopPropagation();
    menuOpen.value = false;
    setUnread(props.conversation.id, !isUnread.value);
}
</script>

<template>
    <span
        ref="root"
        class="cv-conversation-row-actions relative flex shrink-0 items-center"
    >
        <button
            ref="triggerEl"
            type="button"
            title="Chat options"
            class="flex h-6 w-0 shrink-0 items-center justify-center overflow-hidden rounded-full text-converse-textMuted opacity-0 transition-all duration-150 [@media(hover:hover)]:hover:bg-converse-surfaceHover [@media(hover:hover)]:group-hover:w-6 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:w-6 group-focus-within:opacity-100"
            :class="{ 'w-6 opacity-100': menuOpen }"
            @click.stop="toggleMenu"
        >
            <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
                class="shrink-0"
            >
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
            </svg>
        </button>

        <div
            v-if="menuOpen"
            class="cv-animate-pop-in absolute right-0 z-20 overflow-y-auto rounded-[22px] border border-converse-border bg-converse-surface p-2 text-sm shadow-lg"
            :class="[
                openUp ? 'bottom-full mb-1' : 'top-full mt-1',
                isFavourited ? 'w-60' : 'w-52',
            ]"
            :style="{ maxHeight: maxHeight + 'px' }"
            @click.stop
        >
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="toggleMute"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    class="shrink-0 text-converse-textMuted"
                >
                    <path d="M18 16v-5a6 6 0 0 0-4.6-5.8M6 11v5l-2 2h13" />
                    <path d="M3 3l18 18" />
                </svg>
                <span>{{ isMuted ? "Unmute" : "Mute" }}</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-nowrap text-converse-text hover:bg-converse-surfaceHover"
                @click="toggleFavourite"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="shrink-0 text-converse-textMuted"
                >
                    <path
                        d="M12 20s-7-4.4-7-9a3.9 3.9 0 0 1 7-2.4A3.9 3.9 0 0 1 19 11c0 4.6-7 9-7 9Z"
                    />
                </svg>
                <span>{{
                    isFavourited
                        ? "Remove from favourites"
                        : "Add to favourites"
                }}</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="togglePin"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="shrink-0 text-converse-textMuted"
                >
                    <path d="M8 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0ZM12 13v8" />
                </svg>
                <span>{{ isPinned ? "Unpin" : "Pin" }}</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="toggleUnread"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="shrink-0 text-converse-textMuted"
                >
                    <circle cx="12" cy="12" r="9" />
                    <circle v-if="!isUnread" cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
                </svg>
                <span>{{ isUnread ? "Mark as read" : "Mark as unread" }}</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="toggleArchive"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="shrink-0 text-converse-textMuted"
                >
                    <path d="M3 4h18v4H3zM5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 13h4" />
                </svg>
                <span>{{ isArchived ? "Unarchive" : "Archive" }}</span>
            </button>
        </div>
    </span>
</template>
