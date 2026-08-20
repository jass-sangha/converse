<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useConversations } from "../../composables/useConversations";
import { useDropdownPlacement } from "../../composables/useDropdownPlacement";
import { useExclusiveDropdown } from "../../composables/useExclusiveDropdown";
import Icon from "../shared/Icon.vue";

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
        class="chat-conversation-row-actions relative flex shrink-0 items-center"
    >
        <button
            ref="triggerEl"
            type="button"
            title="Chat options"
            class="flex h-6 w-0 shrink-0 items-center justify-center overflow-hidden rounded-full text-riwaaq-textMuted opacity-0 transition-all duration-150 [@media(hover:hover)]:hover:bg-riwaaq-surfaceHover [@media(hover:hover)]:group-hover:w-6 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:w-6 group-focus-within:opacity-100"
            :class="{ 'w-6 opacity-100': menuOpen }"
            @click.stop="toggleMenu"
        >
            <Icon name="more-vertical" :size="14" class="shrink-0" />
        </button>

        <div
            v-if="menuOpen"
            class="chat-animate-pop-in absolute right-0 z-20 overflow-y-auto rounded-chat-lg border border-riwaaq-border bg-riwaaq-surface p-2 text-sm shadow-chat-lg"
            :class="[
                openUp ? 'bottom-full mb-1' : 'top-full mt-1',
                isFavourited ? 'w-60' : 'w-52',
            ]"
            :style="{ maxHeight: maxHeight + 'px' }"
            @click.stop
        >
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="toggleMute"
            >
                <Icon name="mute" :size="15" class="shrink-0 text-riwaaq-textMuted" />
                <span>{{ isMuted ? "Unmute" : "Mute" }}</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-nowrap text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="toggleFavourite"
            >
                <Icon name="heart-outline" :size="15" class="shrink-0 text-riwaaq-textMuted" />
                <span>{{
                    isFavourited
                        ? "Remove from favourites"
                        : "Add to favourites"
                }}</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="togglePin"
            >
                <Icon name="map-pin-outline" :size="15" class="shrink-0 text-riwaaq-textMuted" />
                <span>{{ isPinned ? "Unpin" : "Pin" }}</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="toggleUnread"
            >
                <Icon
                    :name="isUnread ? 'ring' : 'ring-dot'"
                    :size="15"
                    class="shrink-0 text-riwaaq-textMuted"
                />
                <span>{{ isUnread ? "Mark as read" : "Mark as unread" }}</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="toggleArchive"
            >
                <Icon name="archive" :size="15" class="shrink-0 text-riwaaq-textMuted" />
                <span>{{ isArchived ? "Unarchive" : "Archive" }}</span>
            </button>
        </div>
    </span>
</template>
