<script setup>
import { computed, onMounted, watch } from "vue";
import Avatar from "../shared/Avatar.vue";
import ReadReceiptTicks from "../chat/ReadReceiptTicks.vue";
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
</script>

<template>
    <li
        class="cv-row group relative mb-1 flex cursor-pointer items-center gap-[13px] rounded-[20px] px-3 py-3 hover:bg-converse-surfaceHover"
        @click="$emit('select', conversation.id)"
    >
        <div
            v-if="active"
            class="pointer-events-none absolute inset-0 rounded-[20px] bg-converse-accentTint"
        />

        <Avatar
            class="relative shrink-0"
            :name="displayName"
            :avatar-url="avatarUrl"
            :size="46"
        />
        <span
            v-if="isOnline"
            class="pointer-events-none absolute left-[33px] top-[33px] h-[13px] w-[13px] rounded-full border-[2.5px] border-converse-surface bg-converse-sage"
        />

        <div class="relative min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-2">
                <span class="flex min-w-0 items-center gap-1">
                    <span
                        class="truncate text-[14.5px] font-semibold text-converse-text"
                        >{{ displayName }}</span
                    >
                    <svg
                        v-if="isBlocked"
                        viewBox="0 0 24 24"
                        width="11"
                        height="11"
                        fill="currentColor"
                        class="shrink-0 text-converse-danger"
                        title="Blocked"
                    >
                        <path
                            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.94 7.94 0 0 1 4 12a8 8 0 0 1 8-8Zm0 16c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.94 7.94 0 0 1 20 12a8 8 0 0 1-8 8Z"
                        />
                    </svg>
                </span>
                <span
                    v-if="lastActivityLabel"
                    class="shrink-0 text-[11px] text-converse-textDim"
                    >{{ lastActivityLabel }}</span
                >
            </div>
            <div class="mt-[3px] flex items-center justify-between gap-2">
                <span
                    class="flex min-w-0 items-center truncate text-[12.5px] text-converse-textMuted"
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
                    <div class="flex gap-1">
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
                            <path
                                d="M18 16v-5a6 6 0 0 0-4.6-5.8M6 11v5l-2 2h13"
                            />
                            <path d="M3 3l18 18" />
                        </svg>
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
                            v-if="isPinned"
                            viewBox="0 0 24 24"
                            width="13"
                            height="13"
                            fill="currentColor"
                        >
                            <path
                                d="M8 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0ZM8.6 13h6.8L12 21Z"
                            />
                        </svg>
                    </div>

                    <span
                        v-if="conversation.unread_count > 0"
                        class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-converse-accent px-1.5 text-[11px] font-bold text-converse-accentContrast"
                    >
                        {{ conversation.unread_count }}
                    </span>
                </span>
            </div>
        </div>
    </li>
</template>
