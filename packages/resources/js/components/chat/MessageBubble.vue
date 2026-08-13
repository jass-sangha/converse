<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useChatStore } from "../../store";
import { chatableKeyOf } from "../../chatable";
import { useMessages } from "../../composables/useMessages";
import { useMessagePins } from "../../composables/useMessagePins";
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
import SystemMessage from "./message-types/SystemMessage.vue";
import ReplyPreview from "./ReplyPreview.vue";
import EmojiPicker from "../composer/EmojiPicker.vue";
import ReactionPills from "./ReactionPills.vue";
import ReactionDetailsModal from "./ReactionDetailsModal.vue";
import MessageInfoModal from "./MessageInfoModal.vue";
import ReadReceiptTicks from "./ReadReceiptTicks.vue";
import ForwardModal from "./ForwardModal.vue";

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
        path: "M9 3v1H4v2h16V4h-5V3H9Zm-3 6 1 12h10l1-12H6Z",
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

const pinError = ref("");
const root = ref(null);

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

const showMenu = ref(false);
const showReactionPicker = ref(false);
const showFullEmojiPicker = ref(false);
const showForward = ref(false);
const showInfo = ref(false);
const showReactionDetails = ref(false);
const copied = ref(false);

const visibleMenuItems = computed(() =>
    MENU_ITEMS.filter((item) => {
        if (item.ownOnly && !isOwn.value) return false;
        if (item.textOnly && props.message.type !== "text") return false;
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
    showMenu.value = !showMenu.value;
}

function onDocumentClick(event) {
    if (root.value && !root.value.contains(event.target)) {
        showMenu.value = false;
        showReactionPicker.value = false;
        showFullEmojiPicker.value = false;
    }
}

watch([showMenu, showReactionPicker], ([menu, reaction]) => {
    if (menu || reaction) {
        document.addEventListener("click", onDocumentClick);
    } else {
        document.removeEventListener("click", onDocumentClick);
    }
});

onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick));

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
            showReactionPicker.value = true;
            showFullEmojiPicker.value = false;
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
        class="cv-message-bubble flex"
        :class="isOwn ? 'justify-end' : 'justify-start'"
        title="Double-click to reply"
        @dblclick="!message.deleted_for_everyone && emit('reply', message)"
    >
        <div
            class="cv-message-bubble__content group relative max-w-[70%] rounded-cv px-4 py-2 shadow-sm"
            :class="[
                isOwn
                    ? 'rounded-br-md bg-converse-bubbleOut'
                    : 'rounded-bl-md bg-converse-bubbleIn',
                message.reactions?.length ? 'mb-3' : '',
            ]"
        >
            <span
                v-if="message.is_pinned"
                class="cv-message-bubble__pin-indicator absolute -top-2 -left-2 text-xs"
                title="Pinned"
                >📌</span
            >

            <ReplyPreview
                v-if="message.reply_to"
                :reply-to="message.reply_to"
                class="mb-1"
            />

            <p
                v-if="message.deleted_for_everyone"
                class="text-sm italic text-converse-textMuted"
            >
                This message was deleted
            </p>
            <component :is="bodyComponent" v-else :message="message" />

            <div
                class="cv-message-bubble__meta mt-0.5 flex items-center justify-end gap-1 text-[10px] text-converse-textMuted"
            >
                <span>{{
                    new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                }}</span>
                <span v-if="message.edited_at">(edited)</span>
                <ReadReceiptTicks v-if="isOwn" :status="message.status" />
            </div>

            <ReactionPills
                :reactions="message.reactions ?? []"
                :show-count="isGroupConversation"
                class="absolute -bottom-3 z-10"
                :class="isOwn ? 'right-2' : 'left-2'"
                @open="showReactionDetails = true"
            />

            <div
                v-if="!message.deleted_for_everyone"
                class="cv-message-bubble__actions absolute -top-9 z-10 flex items-center gap-0.5 rounded-full border border-converse-border bg-converse-surface px-1 py-1 opacity-0 shadow-lg transition-opacity duration-150 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                :class="isOwn ? 'right-1' : 'left-1'"
            >
                <button
                    type="button"
                    title="React"
                    class="flex h-7 w-7 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                    @click.stop="showReactionPicker = !showReactionPicker; showFullEmojiPicker = false"
                >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="8.5" /><path d="M9 14.5c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5M9 9.5h.01M15 9.5h.01" /></svg>
                </button>
                <button
                    type="button"
                    title="More"
                    class="flex h-7 w-7 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                    @click.stop="toggleMenu"
                >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" /></svg>
                </button>
            </div>

            <div
                v-if="showReactionPicker && !showFullEmojiPicker"
                class="cv-message-bubble__reaction-picker cv-animate-pop-in absolute bottom-full z-20 mb-1 flex items-center gap-0.5 rounded-full border border-converse-border bg-converse-surface p-1.5 shadow-lg"
                :class="isOwn ? 'right-1' : 'left-1'"
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
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" /></svg>
                </button>
            </div>

            <div
                v-if="showReactionPicker && showFullEmojiPicker"
                class="cv-message-bubble__reaction-picker cv-animate-pop-in absolute bottom-full z-20 mb-1"
                :class="isOwn ? 'right-1' : 'left-1'"
                @click.stop
            >
                <EmojiPicker @pick="onPickReaction" />
            </div>

            <div
                v-if="showMenu"
                class="cv-message-bubble__menu cv-animate-pop-in absolute top-6 z-20 w-48 rounded-[22px] border border-converse-border bg-converse-surface p-2 text-sm shadow-lg"
                :class="isOwn ? 'right-1' : 'left-1'"
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
                    @click="onMenuAction(item.key)"
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
