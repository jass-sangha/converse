<script setup>
import { computed, onMounted, ref, watch } from "vue";
import Avatar from "../shared/Avatar.vue";
import ReadReceiptTicks from "../chat/ReadReceiptTicks.vue";
import ConversationRowActions from "./ConversationRowActions.vue";
import Icon from "../shared/Icon.vue";
import { useUsers } from "../../composables/useUsers";
import { useChatStore } from "../../store";
import { chatableKey, chatableKeyOf } from "../../chatable";

const props = defineProps({
    conversation: { type: Object, required: true },
    active: { type: Boolean, default: false },
});

defineEmits(["select"]);

const store = useChatStore();
const { resolve, get } = useUsers();

const isGroup = computed(() => props.conversation.type === "group");

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

const isBlocked = computed(
    () =>
        !!otherParticipant.value &&
        store.blockedKeys.includes(
            chatableKey(otherParticipant.value.type, otherParticipant.value.id),
        ),
);

const isOnline = computed(() => {
    if (isGroup.value || !otherParticipant.value) return false;
    const key = chatableKey(
        otherParticipant.value.type,
        otherParticipant.value.id,
    );
    return !!store.presenceByUser[key]?.is_online;
});

const otherParticipant = computed(() => {
    if (props.conversation.type !== "private") return null;
    const other = (props.conversation.participants ?? []).find(
        (p) => chatableKeyOf(p) !== store.currentKey,
    );
    return other ? { type: other.chatable_type, id: other.chatable_id } : null;
});

async function ensureResolved() {
    if (otherParticipant.value) {
        await resolve([otherParticipant.value]);
    }
}

onMounted(ensureResolved);
watch(otherParticipant, ensureResolved);

const displayName = computed(() => {
    if (props.conversation.type === "group") {
        return props.conversation.name || "Group";
    }

    return otherParticipant.value
        ? get(otherParticipant.value).name
        : "Unknown";
});

const avatarUrl = computed(() => {
    if (props.conversation.avatar_url) return props.conversation.avatar_url;
    return otherParticipant.value
        ? get(otherParticipant.value).avatar_url
        : null;
});

const lastMessagePreview = computed(() => {
    const message = props.conversation.last_message;
    if (!message) return "";
    if (message.deleted_for_everyone) return "This message was deleted";
    if (message.type !== "text") return `[${message.type}]`;
    return message.body ?? "";
});

const isLastMessageOwn = computed(() => {
    const message = props.conversation.last_message;
    return !!message && chatableKeyOf(message) === store.currentKey;
});

const lastActivityLabel = computed(() => {
    const at =
        props.conversation.last_message?.created_at ??
        props.conversation.last_activity_at;
    if (!at) return "";

    const date = new Date(at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    }

    const daysAgo = Math.floor(
        (now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
            86400000,
    );
    if (daysAgo === 1) return "Yesterday";
    if (daysAgo < 7) return date.toLocaleDateString([], { weekday: "long" });
    return date.toLocaleDateString([], {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
});

const rowActions = ref(null);
let pressTimer = null;
let longPressed = false;

function onTouchStart() {
    longPressed = false;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
        longPressed = true;
        rowActions.value?.openMenu();
    }, 500);
}

function cancelPress() {
    clearTimeout(pressTimer);
}

function onTouchEnd(event) {
    clearTimeout(pressTimer);
    if (longPressed) {
        event.preventDefault();
    }
}
</script>

<template>
    <li
        :data-conversation-id="conversation.id"
        class="chat-row group relative mb-1 flex cursor-pointer items-center gap-[13px] rounded-chat px-3 py-3 hover:bg-riwaaq-surfaceHover"
        @click="$emit('select', conversation.id)"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
        @touchmove="cancelPress"
    >
        <div
            v-if="active"
            class="pointer-events-none absolute inset-0 rounded-chat bg-riwaaq-accentTint"
        />

        <Avatar
            class="relative shrink-0"
            :name="displayName"
            :avatar-url="avatarUrl"
            :size="46"
        />
        <span
            v-if="isOnline"
            class="pointer-events-none absolute left-[33px] top-[33px] h-[13px] w-[13px] rounded-full border-[2.5px] border-riwaaq-surface bg-riwaaq-sage"
        />

        <div class="relative min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-2">
                <span class="flex min-w-0 items-center gap-1">
                    <span
                        class="truncate text-[14.5px] font-semibold text-riwaaq-text"
                        >{{ displayName }}</span
                    >
                    <Icon
                        v-if="isBlocked"
                        name="block"
                        :size="11"
                        class="shrink-0 text-riwaaq-danger"
                        title="Blocked"
                    />
                </span>
                <span
                    v-if="lastActivityLabel"
                    class="shrink-0 text-[11px] text-riwaaq-textDim"
                    >{{ lastActivityLabel }}</span
                >
            </div>
            <div class="mt-[3px] flex items-center justify-between gap-2">
                <span
                    class="flex min-w-0 items-center truncate text-[12.5px] text-riwaaq-textMuted"
                >
                    <ReadReceiptTicks
                        v-if="
                            isLastMessageOwn &&
                            !conversation.last_message?.deleted_for_everyone
                        "
                        :status="conversation.last_message.status"
                    />
                    <span class="truncate">{{ lastMessagePreview }}</span>
                </span>
                <span class="flex shrink-0 items-center gap-1">
                    <span v-if="isMuted || isFavourited || isPinned" class="flex items-center gap-1 text-riwaaq-textMuted">
                        <Icon v-if="isMuted" name="mute" :size="13" />
                        <Icon v-if="isFavourited" name="heart-solid" :size="13" />
                        <Icon v-if="isPinned" name="map-pin-solid" :size="13" />
                    </span>

                    <span
                        v-if="conversation.unread_count > 0"
                        class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-riwaaq-accent px-1.5 text-[11px] font-bold text-riwaaq-accentContrast"
                    >
                        {{ conversation.unread_count }}
                    </span>

                    <ConversationRowActions ref="rowActions" :conversation="conversation" />
                </span>
            </div>
        </div>
    </li>
</template>
