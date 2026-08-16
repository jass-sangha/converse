<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useChatStore } from "../../store";
import { chatableKeyOf } from "../../chatable";
import { useMessages } from "../../composables/useMessages";
import { useMessagePins } from "../../composables/useMessagePins";
import { useUsers } from "../../composables/useUsers";
import Avatar from "../shared/Avatar.vue";
import TextMessage from "./message-types/TextMessage.vue";
import ImageMessage from "./message-types/ImageMessage.vue";
import VideoMessage from "./message-types/VideoMessage.vue";
import AudioMessage from "./message-types/AudioMessage.vue";
import VoiceMessage from "./message-types/VoiceMessage.vue";
import DocumentMessage from "./message-types/DocumentMessage.vue";
import LocationMessage from "./message-types/LocationMessage.vue";
import ContactMessage from "./message-types/ContactMessage.vue";
import GifMessage from "./message-types/GifMessage.vue";
import StickerMessage from "./message-types/StickerMessage.vue";
import PollMessage from "./message-types/PollMessage.vue";
import EventMessage from "./message-types/EventMessage.vue";
import CallMessage from "./message-types/CallMessage.vue";
import SystemMessage from "./message-types/SystemMessage.vue";
import ReplyPreview from "./ReplyPreview.vue";
import EmojiPicker from "../composer/EmojiPicker.vue";
import ReactionPills from "./ReactionPills.vue";
import ReactionDetailsModal from "./ReactionDetailsModal.vue";
import MessageInfoModal from "./MessageInfoModal.vue";
import ReadReceiptTicks from "./ReadReceiptTicks.vue";
import ForwardModal from "./ForwardModal.vue";
import { useDropdownPlacement } from "../../composables/useDropdownPlacement";
import { useExclusiveDropdown } from "../../composables/useExclusiveDropdown";

const TYPE_COMPONENTS = {
    text: TextMessage,
    image: ImageMessage,
    video: VideoMessage,
    audio: AudioMessage,
    voice: VoiceMessage,
    document: DocumentMessage,
    location: LocationMessage,
    contact: ContactMessage,
    gif: GifMessage,
    sticker: StickerMessage,
    poll: PollMessage,
    event: EventMessage,
    call: CallMessage,
};

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const MENU_ITEMS = [
    {
        key: "info",
        label: "Message info",
        ownOnly: true,
        path: "M11 7h2v2h-2Zm0 4h2v6h-2Zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
    },
    {
        key: "reply",
        label: "Reply",
        path: "M10 9V4.5L2 12l8 7.5V15c5.2 0 8.8 1.7 11.4 5.3-1-5.2-4.1-10.3-11.4-11.3Z",
    },
    {
        key: "copy",
        label: "Copy",
        path: "M16 1H4a2 2 0 0 0-2 2v14h2V3h12Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11Z",
    },
    {
        key: "react",
        label: "React",
        path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-3.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 17c-2.5 0-4.6-1.5-5.4-3.6h10.8C16.6 15.5 14.5 17 12 17Z",
    },
    {
        key: "forward",
        label: "Forward",
        path: "M14 9V4.5l8 7.5-8 7.5V15c-5.2 0-8.8 1.7-11.4 5.3 1-5.2 4.1-10.3 11.4-11.3Z",
    },
    {
        key: "pin",
        label: "Pin",
        dynamicLabel: true,
        path: "M16 3v6.5l2 3V15h-6v6l-1 1-1-1v-6H4v-2.5l2-3V3Z",
    },
    {
        key: "star",
        label: "Star",
        dynamicLabel: true,
        path: "M12 2 15 9l7 .6-5.3 4.6L18.2 21 12 17.3 5.8 21l1.5-6.8L2 9.6 9 9Z",
    },
    {
        key: "edit",
        label: "Edit",
        ownOnly: true,
        textOnly: true,
        path: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z",
    },
    {
        key: "delete-me",
        label: "Delete for me",
        danger: true,
        path: "M9 3v1H4v2h16V4h-5V3H9Zm-3 6 1 12h10l1-12H6Z",
    },
    {
        key: "delete-everyone",
        label: "Delete for everyone",
        danger: true,
        ownOnly: true,
        windowed: true,
        path: "M9 3v1H4v2h16V4h-5V3H9Zm-3 6 1 12h10l1-12H6Z",
    },
];

// Mirrors config('chat.message.delete_for_everyone_window_minutes') — the backend is the real
// enforcement (this only avoids showing an option that would then 403), so a little drift near
// the boundary is fine.
const DELETE_FOR_EVERYONE_WINDOW_MINUTES = 5;

const props = defineProps({
    message: { type: Object, required: true },
});

const emit = defineEmits(["reply", "edit", "star-changed"]);

const store = useChatStore();
const { react, unreact, star, unstar, deleteForMe, deleteForEveryone } =
    useMessages();
const { pin, unpin } = useMessagePins();
const { get, resolve } = useUsers();

const pinError = ref("");
const root = ref(null);

const DRAG_LIMIT = 72;
const DRAG_THRESHOLD = 40;
// A touch that turns out to be a vertical scroll still fires a few pixels of horizontal
// pointermove noise before its direction is clear — without this dead zone, that noise gets
// read as the start of a slide and the bubble twitches sideways on every scroll attempt.
const DIRECTION_LOCK_PX = 6;

const dragX = ref(0);
const dragging = ref(false);
let dragStartX = 0;
let dragStartY = 0;
// null while direction is still undecided, 'x' once it's a confirmed horizontal slide, 'y' once
// it's a confirmed vertical scroll (and this gesture is no longer ours to handle).
let dragAxis = null;
let dragPointerId = null;

function onDragMove(event) {
    if (event.pointerId !== dragPointerId) return;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;

    if (dragAxis === null) {
        if (
            Math.abs(dx) < DIRECTION_LOCK_PX &&
            Math.abs(dy) < DIRECTION_LOCK_PX
        )
            return;
        dragAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (dragAxis === "x") dragging.value = true;
    }

    if (dragAxis !== "x") return;
    event.preventDefault();
    dragX.value = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dx));
}

function onDragEnd(event) {
    if (event.pointerId !== dragPointerId) return;
    stopDragListeners();

    const wasSliding = dragAxis === "x";
    dragAxis = null;
    dragPointerId = null;
    dragging.value = false;

    if (wasSliding && Math.abs(dragX.value) > DRAG_THRESHOLD) {
        emit("reply", props.message);
    }
    dragX.value = 0;
}

function stopDragListeners() {
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragEnd);
    window.removeEventListener("pointercancel", onDragEnd);
    if (dragPointerId !== null) {
        root.value?.releasePointerCapture?.(dragPointerId);
    }
}

// A fixed-position overlay (the media viewer, any future modal) can render as a DOM
// descendant of the bubble row even though it visually escapes it entirely — pointer capture
// from the drag gesture would otherwise hijack clicks inside it, redirecting the browser's
// synthesized click event's target back to this row no matter where on screen it happened.
function isInsideFixedOverlay(target) {
    let node = target;
    while (node && node !== root.value) {
        if (getComputedStyle(node).position === "fixed") return true;
        node = node.parentElement;
    }
    return false;
}

function onBubblePointerDown(event) {
    if (props.message.deleted_for_everyone) return;
    if (
        event.target.closest(
            "button, input, a, .cv-message-bubble__reaction-picker, .cv-message-bubble__menu",
        )
    )
        return;
    if (isInsideFixedOverlay(event.target)) return;
    // A mouse drag only ever starts from the primary button; touch/pen contacts don't carry a
    // meaningful button value the same way.
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragAxis = null;
    dragPointerId = event.pointerId;
    root.value?.setPointerCapture?.(dragPointerId);

    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragEnd);
    window.addEventListener("pointercancel", onDragEnd);
}

function onBubbleDoubleClick() {
    if (props.message.deleted_for_everyone) return;
    showMenu.value = false;
    showFullEmojiPicker.value = false;
    if (!showReactionPicker.value)
        placePop(actionsEl.value, { preferredHeight: 60 });
    showReactionPicker.value = true;
}

const isOwn = computed(() => chatableKeyOf(props.message) === store.currentKey);
const isSystem = computed(
    () => props.message.type === "system" || props.message.chatable_id === null,
);
const bodyComponent = computed(
    () => TYPE_COMPONENTS[props.message.type] ?? TextMessage,
);
const isGroupConversation = computed(
    () =>
        store.conversations.find((c) => c.id === props.message.conversation_id)
            ?.type === "group",
);

// Group chats need to show who sent an incoming message — a private chat's header already
// says who you're talking to, so this stays off there to match the mockup.
const showSenderInfo = computed(
    () => !isOwn.value && isGroupConversation.value && !isSystem.value,
);
const senderRef = computed(() => ({
    type: props.message.chatable_type,
    id: props.message.chatable_id,
}));
const sender = computed(() => get(senderRef.value));

watch(
    showSenderInfo,
    (show) => {
        if (show) resolve([senderRef.value]);
    },
    { immediate: true },
);

const showMenu = ref(false);
const showReactionPicker = ref(false);
const showFullEmojiPicker = ref(false);
const showForward = ref(false);
const showInfo = ref(false);
const showReactionDetails = ref(false);
const copied = ref(false);
const actionsEl = ref(null);
const {
    openUp: popUp,
    maxHeight: popMax,
    place: placePop,
} = useDropdownPlacement();

const visibleMenuItems = computed(() =>
    MENU_ITEMS.filter((item) => {
        if (item.ownOnly && !isOwn.value) return false;
        if (item.textOnly && props.message.type !== "text") return false;
        if (item.windowed) {
            const ageMinutes =
                (Date.now() - new Date(props.message.created_at).getTime()) /
                60000;
            if (ageMinutes > DELETE_FOR_EVERYONE_WINDOW_MINUTES) return false;
        }
        return true;
    }),
);

function itemLabel(item) {
    if (item.key === "pin") return props.message.is_pinned ? "Unpin" : "Pin";
    if (item.key === "star")
        return props.message.is_starred_by_me ? "Unstar" : "Star";
    return item.label;
}

function toggleMenu() {
    if (showMenu.value) {
        showMenu.value = false;
        return;
    }
    placePop(actionsEl.value, { preferredHeight: 440 });
    showMenu.value = true;
    showReactionPicker.value = false;
    showFullEmojiPicker.value = false;
}

function toggleReactionPicker() {
    if (showReactionPicker.value) {
        showReactionPicker.value = false;
        showFullEmojiPicker.value = false;
        return;
    }
    placePop(actionsEl.value, { preferredHeight: 60 });
    showReactionPicker.value = true;
    showFullEmojiPicker.value = false;
    showMenu.value = false;
}

function onDocumentClick(event) {
    if (root.value && !root.value.contains(event.target)) {
        closeAllPopups();
    }
}

const { opened: dropdownOpened, closed: dropdownClosed } =
    useExclusiveDropdown();

function closeAllPopups() {
    showMenu.value = false;
    showReactionPicker.value = false;
    showFullEmojiPicker.value = false;
}

watch([showMenu, showReactionPicker], ([menu, reaction]) => {
    if (menu || reaction) {
        document.addEventListener("click", onDocumentClick);
        dropdownOpened(closeAllPopups);
    } else {
        document.removeEventListener("click", onDocumentClick);
        dropdownClosed(closeAllPopups);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener("click", onDocumentClick);
    dropdownClosed(closeAllPopups);
    stopDragListeners();
});

async function onPickReaction(emoji) {
    showReactionPicker.value = false;
    showFullEmojiPicker.value = false;
    const mine = props.message.reactions?.find((r) => r.self);
    if (mine && mine.emoji === emoji) {
        await unreact(props.message.id, props.message.conversation_id);
    } else {
        await react(props.message.id, props.message.conversation_id, emoji);
    }
}

async function onStarToggle() {
    showMenu.value = false;
    if (props.message.is_starred_by_me) {
        await unstar(props.message.id);
    } else {
        await star(props.message.id);
    }
    props.message.is_starred_by_me = !props.message.is_starred_by_me;
    emit("star-changed", props.message);
}

async function onPinToggle() {
    showMenu.value = false;
    pinError.value = "";
    try {
        if (props.message.is_pinned) {
            await unpin(props.message);
        } else {
            await pin(props.message);
        }
        props.message.is_pinned = !props.message.is_pinned;
    } catch (e) {
        pinError.value = e.response?.data?.message ?? "Could not update pin.";
    }
}

async function onDeleteForMe() {
    showMenu.value = false;
    await deleteForMe(props.message.id, props.message.conversation_id);
}

async function onDeleteForEveryone() {
    showMenu.value = false;
    await deleteForEveryone(props.message.id, props.message.conversation_id);
}

async function onCopy() {
    if (props.message.type === "text" && props.message.body) {
        await navigator.clipboard.writeText(props.message.body);
        copied.value = true;
        setTimeout(() => (copied.value = false), 1500);
    }
    showMenu.value = false;
}

function onMenuAction(key) {
    switch (key) {
        case "info":
            showMenu.value = false;
            showInfo.value = true;
            return;
        case "reply":
            showMenu.value = false;
            return emit("reply", props.message);
        case "copy":
            return onCopy();
        case "react":
            showMenu.value = false;
            showFullEmojiPicker.value = false;
            if (!showReactionPicker.value)
                placePop(actionsEl.value, { preferredHeight: 60 });
            showReactionPicker.value = true;
            return;
        case "forward":
            showMenu.value = false;
            showForward.value = true;
            return;
        case "pin":
            return onPinToggle();
        case "star":
            return onStarToggle();
        case "edit":
            showMenu.value = false;
            return emit("edit", props.message);
        case "delete-me":
            return onDeleteForMe();
        case "delete-everyone":
            return onDeleteForEveryone();
        default:
            showMenu.value = false;
            return null;
    }
}
</script>

<template>
    <SystemMessage v-if="isSystem" :message="message" />

    <div
        v-else
        ref="root"
        class="cv-message-bubble group flex items-center gap-1.5"
        :class="isOwn ? 'justify-end' : 'justify-start'"
        style="touch-action: pan-y"
        :style="
            dragX !== 0 || dragging
                ? {
                      transform: `translateX(${dragX}px)`,
                      transition: dragging
                          ? 'none'
                          : 'transform .18s cubic-bezier(.22,1,.36,1)',
                  }
                : null
        "
        title="Slide to reply · double-click to react"
        @pointerdown="onBubblePointerDown"
        @dblclick="onBubbleDoubleClick"
    >
        <div
            v-if="!message.deleted_for_everyone && isOwn"
            ref="actionsEl"
            class="cv-message-bubble__actions relative flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            :class="{ 'opacity-100': showMenu || showReactionPicker }"
        >
            <button
                type="button"
                title="React"
                class="flex h-7 w-7 items-center justify-center rounded-full text-converse-textDim hover:bg-converse-surfaceHover hover:text-converse-accentText"
                @click.stop="toggleReactionPicker"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                >
                    <circle cx="12" cy="12" r="8.5" />
                    <path
                        d="M9 14.5c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5M9 9.5h.01M15 9.5h.01"
                    />
                </svg>
            </button>
            <button
                type="button"
                title="More"
                class="flex h-7 w-7 items-center justify-center rounded-full text-converse-textDim hover:bg-converse-surfaceHover hover:text-converse-accentText"
                @click.stop="toggleMenu"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="currentColor"
                >
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                </svg>
            </button>

            <div
                v-if="showReactionPicker && !showFullEmojiPicker"
                class="cv-message-bubble__reaction-picker cv-animate-pop-in absolute right-0 z-20 flex items-center gap-0.5 rounded-full border border-converse-border bg-converse-surface p-1.5 shadow-cv-lg"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
            >
                <button
                    v-for="emoji in QUICK_REACTIONS"
                    :key="emoji"
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-converse-surfaceHover"
                    @click.stop="onPickReaction(emoji)"
                >
                    {{ emoji }}
                </button>
                <button
                    type="button"
                    title="More reactions"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                    @click.stop="showFullEmojiPicker = true"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        fill="currentColor"
                    >
                        <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" />
                    </svg>
                </button>
            </div>

            <div
                v-if="showReactionPicker && showFullEmojiPicker"
                class="cv-message-bubble__reaction-picker cv-animate-pop-in absolute right-0 z-20"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
                @click.stop
            >
                <EmojiPicker @pick="onPickReaction" />
            </div>

            <div
                v-if="showMenu"
                class="cv-message-bubble__menu cv-animate-pop-in absolute right-0 z-20 w-[220px] overflow-y-auto rounded-[22px] border border-converse-border bg-converse-surface p-2 text-sm shadow-cv-lg"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
                :style="{ maxHeight: popMax + 'px' }"
            >
                <button
                    v-for="item in visibleMenuItems"
                    :key="item.key"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left hover:bg-converse-surfaceHover"
                    :class="
                        item.danger
                            ? 'text-converse-danger'
                            : 'text-converse-text'
                    "
                    @click.stop="onMenuAction(item.key)"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="shrink-0"
                    >
                        <path :d="item.path" />
                    </svg>
                    <span>{{ itemLabel(item) }}</span>
                </button>
            </div>
        </div>

        <Avatar
            v-if="showSenderInfo"
            :name="sender.name"
            :avatar-url="sender.avatar_url"
            :size="30"
            class="mb-[3px] self-end"
            :title="sender.name"
        />

        <div
            class="cv-message-bubble__content relative max-w-[min(55%,380px)] rounded-[20px] p-2 shadow-cv"
            :class="[
                isOwn
                    ? 'rounded-br-[8px] bg-converse-bubbleOut'
                    : 'rounded-bl-[8px] bg-converse-bubbleIn',
                message.reactions?.length ? 'mb-3' : '',
            ]"
        >
            <div
                v-if="message.is_pinned || message.is_starred_by_me"
                class="cv-message-bubble__badges absolute -top-2 -left-2 flex items-center gap-1"
            >
                <span
                    v-if="message.is_pinned"
                    class="cv-message-bubble__pin-indicator flex h-5 w-5 items-center justify-center rounded-full bg-converse-surface text-converse-accent shadow-cv"
                    title="Pinned"
                >
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M16 3v6.5l2 3V15h-6v6l-1 1-1-1v-6H4v-2.5l2-3V3Z" /></svg>
                </span>
                <span
                    v-if="message.is_starred_by_me"
                    class="cv-message-bubble__star-indicator flex h-5 w-5 items-center justify-center rounded-full bg-converse-surface text-converse-accent shadow-cv"
                    title="Starred"
                >
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M12 2 15 9l7 .6-5.3 4.6L18.2 21 12 17.3 5.8 21l1.5-6.8L2 9.6 9 9Z" /></svg>
                </span>
            </div>

            <ReplyPreview
                v-if="message.reply_to"
                :reply-to="message.reply_to"
                :is-own="isOwn"
                class="mb-1"
            />

            <p
                v-if="message.deleted_for_everyone"
                class="text-sm italic text-converse-textMuted"
            >
                This message was deleted
            </p>
            <component
                :is="bodyComponent"
                v-else
                :message="message"
                :is-own="isOwn"
            />

            <div
                class="cv-message-bubble__meta mt-1 flex items-center gap-2 text-[10px] text-converse-textMuted"
                :class="showSenderInfo ? 'justify-between' : 'justify-end'"
            >
                <span
                    v-if="showSenderInfo"
                    class="truncate font-bold text-converse-sageText"
                    >{{ sender.name }}</span
                >
                <span class="flex shrink-0 items-center gap-1">
                    <span>{{
                        new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                    }}</span>
                    <span v-if="message.edited_at">(edited)</span>
                    <ReadReceiptTicks v-if="isOwn" :status="message.status" />
                </span>
            </div>

            <ReactionPills
                :reactions="message.reactions ?? []"
                :show-count="isGroupConversation"
                class="absolute -bottom-3 z-10"
                :class="isOwn ? 'right-2' : 'left-2'"
                @open="showReactionDetails = true"
            />

            <p
                v-if="copied"
                class="absolute -bottom-8 right-1 rounded bg-converse-overlay/70 px-2 py-0.5 text-[10px] text-white"
            >
                Copied
            </p>
            <p
                v-if="pinError"
                class="cv-message-bubble__pin-error mt-1 text-xs text-converse-danger"
            >
                {{ pinError }}
            </p>
        </div>

        <div
            v-if="!message.deleted_for_everyone && !isOwn"
            ref="actionsEl"
            class="cv-message-bubble__actions relative flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            :class="{ 'opacity-100': showMenu || showReactionPicker }"
        >
            <button
                type="button"
                title="React"
                class="flex h-7 w-7 items-center justify-center rounded-full text-converse-textDim hover:bg-converse-surfaceHover hover:text-converse-accentText"
                @click.stop="toggleReactionPicker"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                >
                    <circle cx="12" cy="12" r="8.5" />
                    <path
                        d="M9 14.5c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5M9 9.5h.01M15 9.5h.01"
                    />
                </svg>
            </button>
            <button
                type="button"
                title="More"
                class="flex h-7 w-7 items-center justify-center rounded-full text-converse-textDim hover:bg-converse-surfaceHover hover:text-converse-accentText"
                @click.stop="toggleMenu"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="currentColor"
                >
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                </svg>
            </button>

            <div
                v-if="showReactionPicker && !showFullEmojiPicker"
                class="cv-message-bubble__reaction-picker cv-animate-pop-in absolute left-0 z-20 flex items-center gap-0.5 rounded-full border border-converse-border bg-converse-surface p-1.5 shadow-cv-lg"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
            >
                <button
                    v-for="emoji in QUICK_REACTIONS"
                    :key="emoji"
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-converse-surfaceHover"
                    @click.stop="onPickReaction(emoji)"
                >
                    {{ emoji }}
                </button>
                <button
                    type="button"
                    title="More reactions"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                    @click.stop="showFullEmojiPicker = true"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        fill="currentColor"
                    >
                        <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" />
                    </svg>
                </button>
            </div>

            <div
                v-if="showReactionPicker && showFullEmojiPicker"
                class="cv-message-bubble__reaction-picker cv-animate-pop-in absolute left-0 z-20"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
                @click.stop
            >
                <EmojiPicker @pick="onPickReaction" />
            </div>

            <div
                v-if="showMenu"
                class="cv-message-bubble__menu cv-animate-pop-in absolute left-0 z-20 w-[220px] overflow-y-auto rounded-[22px] border border-converse-border bg-converse-surface p-2 text-sm shadow-cv-lg"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
                :style="{ maxHeight: popMax + 'px' }"
            >
                <button
                    v-for="item in visibleMenuItems"
                    :key="item.key"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left hover:bg-converse-surfaceHover"
                    :class="
                        item.danger
                            ? 'text-converse-danger'
                            : 'text-converse-text'
                    "
                    @click.stop="onMenuAction(item.key)"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="shrink-0"
                    >
                        <path :d="item.path" />
                    </svg>
                    <span>{{ itemLabel(item) }}</span>
                </button>
            </div>
        </div>

        <ForwardModal
            v-if="showForward"
            :message-id="message.id"
            @close="showForward = false"
        />
        <ReactionDetailsModal
            v-if="showReactionDetails"
            :message="message"
            @close="showReactionDetails = false"
        />
        <MessageInfoModal
            v-if="showInfo"
            :message="message"
            @close="showInfo = false"
        />
    </div>
</template>
