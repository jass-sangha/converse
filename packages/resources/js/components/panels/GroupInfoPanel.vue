<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useExclusiveDropdown } from "../../composables/useExclusiveDropdown";
import { useDropdownPlacement } from "../../composables/useDropdownPlacement";
import Avatar from "../shared/Avatar.vue";
import AvatarPhotoControl from "../shared/AvatarPhotoControl.vue";
import UserPicker from "../shared/UserPicker.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import DisappearingToggle from "./DisappearingToggle.vue";
import MediaDocsLinksGrid from "./MediaDocsLinksGrid.vue";
import MuteDurationMenu from "../shared/MuteDurationMenu.vue";
import { mutedUntilFor } from "../../muteDurations";
import { useChatStore } from "../../store";
import { chatableKey, chatableKeyOf } from "../../chatable";
import { useUsers } from "../../composables/useUsers";
import { useParticipants } from "../../composables/useParticipants";
import { useBlockedUsers } from "../../composables/useBlockedUsers";
import { useConversations } from "../../composables/useConversations";
import { useMessages } from "../../composables/useMessages";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { useCall } from "../../composables/useCall";
import { WALLPAPER_PRESETS } from "../../wallpapers";

const props = defineProps({
    conversation: { type: Object, required: true },
});

const emit = defineEmits(["close"]);

const store = useChatStore();
const { resolve, get } = useUsers();
const { add, remove, changeRole } = useParticipants();
const { block, unblock, list: listBlocked } = useBlockedUsers();
const {
    refreshOne,
    leave,
    setWallpaper,
    setFavourited,
    mute,
    setHidden,
    updateAvatar,
    removeAvatar,
} = useConversations();
const { clear: clearMessages } = useMessages();
const { setView } = useSidebarUi();
const { startCall } = useCall();

const showAddMember = ref(false);
const picked = ref([]);
const error = ref("");
const blockedKeys = ref([]);
const showMedia = ref(false);
const mediaCount = ref(0);
const clearing = ref(false);
const cleared = ref(false);
const avatarUploading = ref(false);
const avatarError = ref("");

const isGroup = computed(() => props.conversation.type === "group");
const myRole = computed(() => props.conversation.me?.role);
const isAdmin = computed(() => myRole.value === "admin");
const isMuted = computed(() => !!props.conversation.me?.muted_until);
const isFavourite = computed(
    () =>
        !!(
            props.conversation.favourited_at ||
            props.conversation.me?.favourited_at
        ),
);

function isMe(participant) {
    return chatableKeyOf(participant) === store.currentKey;
}

const currentParticipantRefs = computed(() =>
    (props.conversation.participants ?? []).map((p) => ({
        type: p.chatable_type,
        id: p.chatable_id,
    })),
);

const otherParticipantRow = computed(() => {
    if (isGroup.value) return null;
    return (
        (props.conversation.participants ?? []).find((p) => !isMe(p)) ?? null
    );
});

const otherParticipant = computed(() => {
    const row = otherParticipantRow.value;
    return row ? get({ type: row.chatable_type, id: row.chatable_id }) : null;
});

const isOtherBlocked = computed(() => {
    const row = otherParticipantRow.value;
    return row
        ? blockedKeys.value.includes(
              chatableKey(row.chatable_type, row.chatable_id),
          )
        : false;
});

const displayName = computed(() =>
    isGroup.value
        ? props.conversation.name || "Group"
        : otherParticipant.value?.name,
);

const otherPresence = computed(() => {
    const row = otherParticipantRow.value;
    if (!row) return null;
    return store.presenceByUser[chatableKey(row.chatable_type, row.chatable_id)];
});

const subLabel = computed(() => {
    if (isGroup.value) {
        const count = props.conversation.participants?.length ?? 0;
        return `${count} participant${count === 1 ? "" : "s"}`;
    }
    if (otherPresence.value?.is_online) return "online";
    if (otherPresence.value?.last_seen_at) {
        const diffMs = Date.now() - new Date(otherPresence.value.last_seen_at).getTime();
        const minutes = Math.round(diffMs / 60000);
        if (minutes < 1) return "last seen just now";
        if (minutes < 60) return `last seen ${minutes}m ago`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return `last seen ${hours}h ago`;
        return `last seen ${Math.round(hours / 24)}d ago`;
    }
    return "";
});

async function toggleQuickMute() {
    await mute(props.conversation.id, isMuted.value ? null : mutedUntilFor("always"));
}

async function loadAll() {
    const refs = (props.conversation.participants ?? []).map((p) => ({
        type: p.chatable_type,
        id: p.chatable_id,
    }));
    if (refs.length) await resolve(refs);

    if (!isGroup.value) {
        const blocked = await listBlocked();
        blockedKeys.value = blocked.map((b) =>
            chatableKey(b.blocked_type, b.blocked_id),
        );
    }

    const messages = store.messagesByConversation[props.conversation.id] ?? [];
    mediaCount.value = messages.filter(
        (m) =>
            ["image", "video", "document"].includes(m.type) &&
            !m.deleted_for_everyone,
    ).length;
}

onMounted(loadAll);
watch(() => props.conversation.id, loadAll);

async function addMembers() {
    error.value = "";
    try {
        await add(props.conversation.id, picked.value);
        await refreshOne(props.conversation.id);
        closeAddMember();
    } catch (e) {
        error.value = e.response?.data?.message ?? "Could not add members.";
    }
}

function closeAddMember() {
    showAddMember.value = false;
    picked.value = [];
    error.value = "";
}

async function onAvatarUpload(file) {
    avatarError.value = "";
    avatarUploading.value = true;

    try {
        await updateAvatar(props.conversation.id, file);
    } catch (e) {
        avatarError.value =
            e.response?.data?.message ?? "Could not update photo.";
    } finally {
        avatarUploading.value = false;
    }
}

async function onAvatarRemove() {
    avatarError.value = "";
    avatarUploading.value = true;

    try {
        await removeAvatar(props.conversation.id);
    } catch (e) {
        avatarError.value =
            e.response?.data?.message ?? "Could not remove photo.";
    } finally {
        avatarUploading.value = false;
    }
}

async function removeMember(participant) {
    error.value = "";
    try {
        await remove(
            props.conversation.id,
            participant.chatable_type,
            participant.chatable_id,
        );
        await refreshOne(props.conversation.id);
    } catch (e) {
        error.value = e.response?.data?.message ?? "Could not remove member.";
    }
}

async function toggleAdmin(participant) {
    error.value = "";
    try {
        await changeRole(
            props.conversation.id,
            participant.chatable_type,
            participant.chatable_id,
            participant.role === "admin" ? "member" : "admin",
        );
        await refreshOne(props.conversation.id);
    } catch (e) {
        error.value = e.response?.data?.message ?? "Could not change role.";
    }
}

async function leaveGroup() {
    error.value = "";
    try {
        await leave(props.conversation.id);
        emit("close");
    } catch (e) {
        error.value = e.response?.data?.message ?? "Could not leave the group.";
    }
}

async function onPickWallpaper(key) {
    await setWallpaper(props.conversation.id, key === "default" ? null : key);
}

async function onPickCustomColor(event) {
    await setWallpaper(props.conversation.id, event.target.value);
}

async function toggleBlockOther() {
    const row = otherParticipantRow.value;
    if (!row) return;

    const key = chatableKey(row.chatable_type, row.chatable_id);

    if (isOtherBlocked.value) {
        await unblock(row.chatable_type, row.chatable_id);
        blockedKeys.value = blockedKeys.value.filter((k) => k !== key);
    } else {
        await block({ type: row.chatable_type, id: row.chatable_id });
        blockedKeys.value.push(key);
    }
}

const showMuteMenu = ref(false);
const muteMenuRoot = ref(null);
const { opened: muteMenuOpened, closed: muteMenuClosed } =
    useExclusiveDropdown();
const { openUp: muteMenuUp, maxHeight: muteMenuMaxHeight, place: placeMuteMenu } =
    useDropdownPlacement();

function closeMuteMenu() {
    showMuteMenu.value = false;
}

function toggleMuteMenu() {
    if (!showMuteMenu.value) placeMuteMenu(muteMenuRoot.value, { preferredHeight: 300 });
    showMuteMenu.value = !showMuteMenu.value;
}

function onMuteMenuDocumentClick(event) {
    if (muteMenuRoot.value && !muteMenuRoot.value.contains(event.target)) {
        closeMuteMenu();
    }
}

watch(showMuteMenu, (open) => {
    if (open) {
        muteMenuOpened(closeMuteMenu);
        document.addEventListener("click", onMuteMenuDocumentClick);
    } else {
        muteMenuClosed(closeMuteMenu);
        document.removeEventListener("click", onMuteMenuDocumentClick);
    }
});

onBeforeUnmount(() => {
    muteMenuClosed(closeMuteMenu);
    document.removeEventListener("click", onMuteMenuDocumentClick);
});

async function onPickMuteDuration(durationKey) {
    showMuteMenu.value = false;
    await mute(props.conversation.id, mutedUntilFor(durationKey));
}

async function onUnmute() {
    showMuteMenu.value = false;
    await mute(props.conversation.id, null);
}

async function toggleFavourite() {
    await setFavourited(props.conversation.id, !isFavourite.value);
}

async function onClearChat() {
    if (clearing.value) return;
    clearing.value = true;
    try {
        await clearMessages(props.conversation.id);
        mediaCount.value = 0;
        cleared.value = true;
        setTimeout(() => (cleared.value = false), 2000);
    } finally {
        clearing.value = false;
    }
}

async function onDeleteChat() {
    await setHidden(props.conversation.id, true);
    emit("close");
}
</script>

<template>
    <div
        class="cv-group-info-panel cv-animate-panel-in fixed inset-0 z-40 flex flex-col overflow-y-auto bg-converse-surface sm:relative sm:z-auto sm:w-[330px] sm:shrink-0 sm:border-l sm:border-converse-border"
    >
        <div
            class="cv-group-info-panel__avatar flex flex-col items-center gap-3 border-b border-converse-border px-5 py-6 text-center"
        >
            <AvatarPhotoControl
                :name="displayName ?? ''"
                :avatar-url="
                    isGroup
                        ? conversation.avatar_url
                        : otherParticipant?.avatar_url
                "
                :size="96"
                :editable="isGroup && isAdmin"
                :uploading="avatarUploading"
                @upload="onAvatarUpload"
                @remove="onAvatarRemove"
            />
            <p v-if="avatarError" class="text-xs text-converse-danger">
                {{ avatarError }}
            </p>
            <div>
                <p class="font-display text-xl font-normal text-converse-text">
                    {{ displayName }}
                </p>
                <p v-if="subLabel" class="mt-1 text-xs text-converse-textMuted">
                    {{ subLabel }}
                </p>
                <p
                    v-if="conversation.description"
                    class="mt-1 px-4 text-center text-sm text-converse-textMuted"
                >
                    {{ conversation.description }}
                </p>
            </div>
            <div class="flex gap-2">
                <button
                    type="button"
                    class="h-9 rounded-full bg-converse-sageTint px-4 text-xs font-semibold text-converse-sageText hover:bg-converse-sage hover:text-white"
                    @click="startCall(conversation, { video: false })"
                >
                    Call
                </button>
                <button
                    type="button"
                    class="h-9 rounded-full border border-converse-border px-4 text-xs font-semibold text-converse-textMuted hover:bg-converse-surfaceHover"
                    @click="toggleQuickMute"
                >
                    {{ isMuted ? "Unmute" : "Mute" }}
                </button>
                <button
                    type="button"
                    class="h-9 rounded-full border border-converse-border px-4 text-xs font-semibold text-converse-textMuted hover:bg-converse-surfaceHover"
                    @click="emit('close')"
                >
                    Close
                </button>
            </div>
        </div>

        <p
            v-if="error"
            class="cv-group-info-panel__error mx-3 mt-3 rounded bg-converse-danger/10 p-2 text-xs text-converse-danger"
        >
            {{ error }}
        </p>

        <div class="border-b border-converse-border py-1">
            <button
                type="button"
                class="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-converse-surfaceHover"
                @click="showMedia = true"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="shrink-0 text-converse-textMuted"
                >
                    <path
                        d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm11 10.5-2.5-3-3.5 4.5H16Zm-8-6.5A1.5 1.5 0 1 0 7 9.5 1.5 1.5 0 0 0 7 6Z"
                    />
                </svg>
                <span class="flex-1 text-[15px] text-converse-text"
                    >Media, links and docs</span
                >
                <span class="text-sm text-converse-textMuted">{{
                    mediaCount
                }}</span>
            </button>

            <button
                type="button"
                class="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-converse-surfaceHover"
                @click="setView('starred')"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="shrink-0 text-converse-textMuted"
                >
                    <path
                        d="M12 2 15 9l7 .6-5.3 4.6L18.2 21 12 17.3 5.8 21l1.5-6.8L2 9.6 9 9Z"
                    />
                </svg>
                <span class="flex-1 text-[15px] text-converse-text"
                    >Starred messages</span
                >
            </button>

            <div
                ref="muteMenuRoot"
                class="relative flex w-full items-center gap-4 px-4 py-3"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="shrink-0 text-converse-textMuted"
                >
                    <path
                        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6-1.6-1.6V10a5.4 5.4 0 0 0-4.5-5.32V3.5a1 1 0 1 0-2 0v1.18A5.4 5.4 0 0 0 6.4 10v4.4L4.8 16v1h14.4v-1Z"
                    />
                </svg>
                <button
                    type="button"
                    class="flex-1 text-left"
                    @click="toggleMuteMenu"
                >
                    <span class="block text-[15px] text-converse-text"
                        >Mute notifications</span
                    >
                    <span
                        v-if="isMuted"
                        class="block text-xs text-converse-textMuted"
                        >Muted until
                        {{
                            new Date(
                                conversation.me.muted_until,
                            ).toLocaleString([], {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })
                        }}</span
                    >
                </button>
                <button
                    type="button"
                    class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-converse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-converse-surface"
                    :class="isMuted ? 'bg-converse-sage' : 'bg-converse-border'"
                    role="switch"
                    :aria-checked="isMuted"
                    @click="toggleMuteMenu"
                >
                    <span
                        class="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-converse-accentContrast shadow transition-transform"
                        :class="isMuted ? 'translate-x-5' : 'translate-x-0.5'"
                    />
                </button>

                <div
                    v-if="showMuteMenu"
                    class="cv-animate-pop-in absolute right-4 z-20 overflow-y-auto rounded-[22px]"
                    :class="muteMenuUp ? 'bottom-full mb-1' : 'top-full mt-1'"
                    :style="{ maxHeight: muteMenuMaxHeight + 'px' }"
                >
                    <MuteDurationMenu
                        :show-unmute="isMuted"
                        @pick="onPickMuteDuration"
                        @unmute="onUnmute"
                    />
                </div>
            </div>

            <DisappearingToggle :conversation="conversation" />
        </div>

        <div class="border-b border-converse-border py-1">
            <h3
                class="px-4 pb-1 pt-2 text-xs font-medium uppercase text-converse-textMuted"
            >
                Chat wallpaper
            </h3>
            <div class="flex flex-wrap gap-2 px-4 pb-3">
                <button
                    v-for="preset in WALLPAPER_PRESETS"
                    :key="preset.key"
                    type="button"
                    :title="preset.label"
                    class="h-7 w-7 rounded-full border-2"
                    :class="
                        (conversation.me?.wallpaper ?? 'default') === preset.key
                            ? 'border-converse-accent'
                            : 'border-converse-border'
                    "
                    :style="{ backgroundColor: preset.css ?? 'transparent' }"
                    @click="onPickWallpaper(preset.key)"
                />
                <label
                    class="relative h-7 w-7 cursor-pointer rounded-full border-2 border-converse-border"
                    title="Custom color"
                >
                    <input
                        type="color"
                        class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        @input="onPickCustomColor"
                    />
                    <span
                        class="pointer-events-none absolute inset-0 flex items-center justify-center text-xs"
                        >🎨</span
                    >
                </label>
            </div>
        </div>

        <template v-if="isGroup">
            <div class="border-b border-converse-border py-3">
                <div class="mb-2 flex items-center justify-between px-4">
                    <h3
                        class="text-xs font-medium uppercase text-converse-textMuted"
                    >
                        {{ conversation.participants?.length ?? 0 }}
                        participants
                    </h3>
                    <button
                        v-if="isAdmin"
                        type="button"
                        class="text-xs text-converse-accent"
                        @click="showAddMember = true"
                    >
                        Add
                    </button>
                </div>

                <ul>
                    <li
                        v-for="participant in conversation.participants"
                        :key="chatableKeyOf(participant)"
                        class="flex items-center gap-3 px-4 py-1.5"
                    >
                        <Avatar
                            :name="
                                get({
                                    type: participant.chatable_type,
                                    id: participant.chatable_id,
                                }).name
                            "
                            :avatar-url="
                                get({
                                    type: participant.chatable_type,
                                    id: participant.chatable_id,
                                }).avatar_url
                            "
                            :size="36"
                        />
                        <div class="min-w-0 flex-1">
                            <p class="truncate text-sm text-converse-text">
                                {{
                                    get({
                                        type: participant.chatable_type,
                                        id: participant.chatable_id,
                                    }).name
                                }}
                            </p>
                            <p
                                v-if="participant.role === 'admin'"
                                class="text-xs text-converse-textMuted"
                            >
                                Admin
                            </p>
                        </div>
                        <div
                            v-if="isAdmin && !isMe(participant)"
                            class="flex gap-2"
                        >
                            <button
                                type="button"
                                class="text-xs text-converse-accent"
                                @click="toggleAdmin(participant)"
                            >
                                {{
                                    participant.role === "admin"
                                        ? "Demote"
                                        : "Promote"
                                }}
                            </button>
                            <button
                                type="button"
                                class="text-xs text-converse-danger"
                                @click="removeMember(participant)"
                            >
                                Remove
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </template>

        <div class="py-1">
            <button
                type="button"
                class="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-converse-surfaceHover"
                @click="toggleFavourite"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="shrink-0 text-converse-textMuted"
                >
                    <path
                        d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54Z"
                    />
                </svg>
                <span class="text-[15px] text-converse-text">{{
                    isFavourite ? "Remove from favourites" : "Add to favourites"
                }}</span>
            </button>

            <button
                type="button"
                class="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-converse-surfaceHover disabled:opacity-50"
                :disabled="clearing"
                @click="onClearChat"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="shrink-0 text-converse-textMuted"
                >
                    <path d="M15 4V3H9v1H4v2h16V4h-5ZM6 8l1 12h10l1-12H6Z" />
                </svg>
                <span class="text-[15px] text-converse-text">{{
                    cleared ? "Chat cleared" : "Clear chat"
                }}</span>
            </button>

            <template v-if="!isGroup">
                <button
                    type="button"
                    class="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-converse-surfaceHover"
                    @click="toggleBlockOther"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="shrink-0 text-converse-danger"
                    >
                        <path
                            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.94 7.94 0 0 1 4 12a8 8 0 0 1 8-8Zm0 16c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.94 7.94 0 0 1 20 12a8 8 0 0 1-8 8Z"
                        />
                    </svg>
                    <span class="text-[15px] text-converse-danger"
                        >{{ isOtherBlocked ? "Unblock" : "Block" }}
                        {{ otherParticipant?.name }}</span
                    >
                </button>

                <!-- <button
                    type="button"
                    title="Not available yet"
                    class="flex w-full cursor-not-allowed items-center gap-4 px-4 py-3 text-left opacity-50"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="shrink-0 text-converse-danger"
                    >
                        <path
                            d="M14 3v1h-4V3H8v2H4v2h16V5h-4V3ZM6 9l1 11h10l1-11Z"
                        />
                    </svg>
                    <span class="text-[15px] text-converse-danger"
                        >Report {{ otherParticipant?.name }}</span
                    >
                </button> -->
            </template>

            <button
                v-else
                type="button"
                class="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-converse-surfaceHover"
                @click="leaveGroup"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="shrink-0 text-converse-danger"
                >
                    <path
                        d="M10 3v2H5v14h5v2H3V3h7Zm5.29 3.71L18.59 10H8v2h10.59l-3.3 3.29 1.42 1.42L22 11.41l-5.29-5.3-1.42 1.6Z"
                    />
                </svg>
                <span class="text-[15px] text-converse-danger"
                    >Leave group</span
                >
            </button>

            <button
                type="button"
                class="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-converse-surfaceHover"
                @click="onDeleteChat"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="shrink-0 text-converse-danger"
                >
                    <path d="M9 3v1H4v2h16V4h-5V3H9Zm-3 6 1 12h10l1-12H6Z" />
                </svg>
                <span class="text-[15px] text-converse-danger"
                    >Delete chat</span
                >
            </button>
        </div>

        <div
            v-if="showAddMember"
            class="absolute inset-0 z-10 flex flex-col bg-converse-surface"
        >
            <SidebarScreenHeader title="Add participants" @back="closeAddMember">
                <GlobalMenu />
            </SidebarScreenHeader>
            <div class="flex min-h-0 flex-1 flex-col">
                <UserPicker
                    v-model="picked"
                    :multiple="true"
                    :exclude="currentParticipantRefs"
                    class="min-h-0 flex-1"
                />
                <p v-if="error" class="shrink-0 px-4 pb-2 text-xs text-converse-danger">
                    {{ error }}
                </p>
            </div>
            <div class="border-t border-converse-border p-3">
                <button
                    type="button"
                    class="w-full rounded-full bg-converse-accent py-2 text-sm font-semibold text-converse-accentContrast disabled:opacity-50"
                    :disabled="!picked.length"
                    @click="addMembers"
                >
                    Add selected
                </button>
            </div>
        </div>

        <div
            v-if="showMedia"
            class="absolute inset-0 z-10 flex flex-col bg-converse-surface"
        >
            <SidebarScreenHeader
                title="Media, links and docs"
                @back="showMedia = false"
            >
                <GlobalMenu />
            </SidebarScreenHeader>
            <MediaDocsLinksGrid
                :conversation-id="conversation.id"
                class="flex-1"
            />
        </div>
    </div>
</template>
