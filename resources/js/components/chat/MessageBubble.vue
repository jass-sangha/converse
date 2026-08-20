<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useChatStore } from "../../store";
import { chatableKeyOf } from "../../chatable";
import { useMessages } from "../../composables/useMessages";
import { useMessagePins } from "../../composables/useMessagePins";
import { useUsers } from "../../composables/useUsers";
import Avatar from "../shared/Avatar.vue";
import Icon from "../shared/Icon.vue";
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
import MessageEditHistoryModal from "./MessageEditHistoryModal.vue";
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

// Mirror config('chat.message.edit_window_minutes') / delete_for_everyone_window_minutes — the
// backend is the real enforcement (this only avoids showing an option that would then 403), so a
// little drift near the boundary is fine.
const EDIT_WINDOW_MINUTES = 15;
const DELETE_FOR_EVERYONE_WINDOW_MINUTES = 5;

const MENU_ITEMS = [
    {
        key: "info",
        label: "Message info",
        ownOnly: true,
        icon: "info",
    },
    {
        key: "reply",
        label: "Reply",
        icon: "reply",
    },
    {
        key: "copy",
        label: "Copy",
        icon: "copy",
    },
    {
        key: "react",
        label: "React",
        icon: "smile-face",
    },
    {
        key: "forward",
        label: "Forward",
        icon: "forward",
    },
    {
        key: "pin",
        label: "Pin",
        dynamicLabel: true,
        icon: "pin",
    },
    {
        key: "star",
        label: "Star",
        dynamicLabel: true,
        icon: "star",
    },
    {
        key: "edit",
        label: "Edit",
        ownOnly: true,
        textOnly: true,
        windowMinutes: EDIT_WINDOW_MINUTES,
        icon: "edit",
    },
    {
        key: "delete-me",
        label: "Delete for me",
        danger: true,
        icon: "trash",
    },
    {
        key: "delete-everyone",
        label: "Delete for everyone",
        danger: true,
        ownOnly: true,
        windowMinutes: DELETE_FOR_EVERYONE_WINDOW_MINUTES,
        icon: "trash",
    },
];

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
            "button, input, a, .chat-message-bubble__reaction-picker, .chat-message-bubble__menu",
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
const showEditHistory = ref(false);
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
        if (item.windowMinutes) {
            const ageMinutes =
                (Date.now() - new Date(props.message.created_at).getTime()) /
                60000;
            if (ageMinutes > item.windowMinutes) return false;
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
        class="chat-message-bubble group flex items-center gap-1.5"
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
            class="chat-message-bubble__actions relative flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            :class="{ 'opacity-100': showMenu || showReactionPicker }"
        >
            <button
                type="button"
                title="React"
                class="flex h-7 w-7 items-center justify-center rounded-full text-riwaaq-textDim hover:bg-riwaaq-surfaceHover hover:text-riwaaq-accentText"
                @click.stop="toggleReactionPicker"
            >
                <Icon name="smile" :size="15" />
            </button>
            <button
                type="button"
                title="More"
                class="flex h-7 w-7 items-center justify-center rounded-full text-riwaaq-textDim hover:bg-riwaaq-surfaceHover hover:text-riwaaq-accentText"
                @click.stop="toggleMenu"
            >
                <Icon name="more-vertical" :size="15" />
            </button>

            <div
                v-if="showReactionPicker && !showFullEmojiPicker"
                class="chat-message-bubble__reaction-picker chat-animate-pop-in absolute right-0 z-20 flex items-center gap-0.5 rounded-full border border-riwaaq-border bg-riwaaq-surface p-1.5 shadow-chat-lg"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
            >
                <button
                    v-for="emoji in QUICK_REACTIONS"
                    :key="emoji"
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-riwaaq-surfaceHover"
                    @click.stop="onPickReaction(emoji)"
                >
                    {{ emoji }}
                </button>
                <button
                    type="button"
                    title="More reactions"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover"
                    @click.stop="showFullEmojiPicker = true"
                >
                    <Icon name="plus" :size="15" />
                </button>
            </div>

            <div
                v-if="showReactionPicker && showFullEmojiPicker"
                class="chat-message-bubble__reaction-picker chat-animate-pop-in absolute right-0 z-20"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
                @click.stop
            >
                <EmojiPicker @pick="onPickReaction" />
            </div>

            <div
                v-if="showMenu"
                class="chat-message-bubble__menu chat-animate-pop-in absolute right-0 z-20 w-[220px] overflow-y-auto rounded-chat-lg border border-riwaaq-border bg-riwaaq-surface p-2 text-sm shadow-chat-lg"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
                :style="{ maxHeight: popMax + 'px' }"
            >
                <button
                    v-for="item in visibleMenuItems"
                    :key="item.key"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left hover:bg-riwaaq-surfaceHover"
                    :class="
                        item.danger
                            ? 'text-riwaaq-danger'
                            : 'text-riwaaq-text'
                    "
                    @click.stop="onMenuAction(item.key)"
                >
                    <Icon :name="item.icon" :size="16" class="shrink-0" />
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
            class="chat-message-bubble__content relative max-w-[min(55%,380px)] rounded-chat p-2 shadow-chat"
            :class="[
                isOwn
                    ? 'rounded-br-[8px] bg-riwaaq-bubbleOut'
                    : 'rounded-bl-[8px] bg-riwaaq-bubbleIn',
                message.reactions?.length ? 'mb-3' : '',
            ]"
        >
            <div
                v-if="message.is_pinned || message.is_starred_by_me"
                class="chat-message-bubble__badges absolute -top-2 -left-2 flex items-center gap-1"
            >
                <span
                    v-if="message.is_pinned"
                    class="chat-message-bubble__pin-indicator flex h-5 w-5 items-center justify-center rounded-full bg-riwaaq-surface text-riwaaq-accent shadow-chat"
                    title="Pinned"
                >
                    <Icon name="pin" :size="11" />
                </span>
                <span
                    v-if="message.is_starred_by_me"
                    class="chat-message-bubble__star-indicator flex h-5 w-5 items-center justify-center rounded-full bg-riwaaq-surface text-riwaaq-accent shadow-chat"
                    title="Starred"
                >
                    <Icon name="star" :size="11" />
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
                class="text-sm italic text-riwaaq-textMuted"
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
                class="chat-message-bubble__meta mt-1 flex items-center gap-2 text-[10px] text-riwaaq-textMuted"
                :class="showSenderInfo ? 'justify-between' : 'justify-end'"
            >
                <span
                    v-if="showSenderInfo"
                    class="truncate font-bold text-riwaaq-sageText"
                    >{{ sender.name }}</span
                >
                <span class="flex shrink-0 items-center gap-1">
                    <span>{{
                        new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                    }}</span>
                    <button
                        v-if="message.edited_at"
                        type="button"
                        class="hover:text-riwaaq-text"
                        @click.stop="showEditHistory = true"
                    >
                        (edited)
                    </button>
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
                class="absolute -bottom-8 right-1 rounded bg-riwaaq-overlay/70 px-2 py-0.5 text-[10px] text-white"
            >
                Copied
            </p>
            <p
                v-if="pinError"
                class="chat-message-bubble__pin-error mt-1 text-xs text-riwaaq-danger"
            >
                {{ pinError }}
            </p>
        </div>

        <div
            v-if="!message.deleted_for_everyone && !isOwn"
            ref="actionsEl"
            class="chat-message-bubble__actions relative flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            :class="{ 'opacity-100': showMenu || showReactionPicker }"
        >
            <button
                type="button"
                title="React"
                class="flex h-7 w-7 items-center justify-center rounded-full text-riwaaq-textDim hover:bg-riwaaq-surfaceHover hover:text-riwaaq-accentText"
                @click.stop="toggleReactionPicker"
            >
                <Icon name="smile" :size="15" />
            </button>
            <button
                type="button"
                title="More"
                class="flex h-7 w-7 items-center justify-center rounded-full text-riwaaq-textDim hover:bg-riwaaq-surfaceHover hover:text-riwaaq-accentText"
                @click.stop="toggleMenu"
            >
                <Icon name="more-vertical" :size="15" />
            </button>

            <div
                v-if="showReactionPicker && !showFullEmojiPicker"
                class="chat-message-bubble__reaction-picker chat-animate-pop-in absolute left-0 z-20 flex items-center gap-0.5 rounded-full border border-riwaaq-border bg-riwaaq-surface p-1.5 shadow-chat-lg"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
            >
                <button
                    v-for="emoji in QUICK_REACTIONS"
                    :key="emoji"
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-riwaaq-surfaceHover"
                    @click.stop="onPickReaction(emoji)"
                >
                    {{ emoji }}
                </button>
                <button
                    type="button"
                    title="More reactions"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover"
                    @click.stop="showFullEmojiPicker = true"
                >
                    <Icon name="plus" :size="15" />
                </button>
            </div>

            <div
                v-if="showReactionPicker && showFullEmojiPicker"
                class="chat-message-bubble__reaction-picker chat-animate-pop-in absolute left-0 z-20"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
                @click.stop
            >
                <EmojiPicker @pick="onPickReaction" />
            </div>

            <div
                v-if="showMenu"
                class="chat-message-bubble__menu chat-animate-pop-in absolute left-0 z-20 w-[220px] overflow-y-auto rounded-chat-lg border border-riwaaq-border bg-riwaaq-surface p-2 text-sm shadow-chat-lg"
                :class="popUp ? 'bottom-full mb-2' : 'top-full mt-2'"
                :style="{ maxHeight: popMax + 'px' }"
            >
                <button
                    v-for="item in visibleMenuItems"
                    :key="item.key"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left hover:bg-riwaaq-surfaceHover"
                    :class="
                        item.danger
                            ? 'text-riwaaq-danger'
                            : 'text-riwaaq-text'
                    "
                    @click.stop="onMenuAction(item.key)"
                >
                    <Icon :name="item.icon" :size="16" class="shrink-0" />
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
        <MessageEditHistoryModal
            v-if="showEditHistory"
            :message="message"
            @close="showEditHistory = false"
        />
    </div>
</template>
