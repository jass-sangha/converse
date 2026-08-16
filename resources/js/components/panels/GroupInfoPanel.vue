<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useExclusiveDropdown } from "../../composables/useExclusiveDropdown";
import { useDropdownPlacement } from "../../composables/useDropdownPlacement";
import Avatar from "../shared/Avatar.vue";
import AvatarPhotoControl from "../shared/AvatarPhotoControl.vue";
import UserPicker from "../shared/UserPicker.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import MediaViewerModal from "../shared/MediaViewerModal.vue";
import DisappearingToggle from "./DisappearingToggle.vue";
import MediaDocsLinksGrid from "./MediaDocsLinksGrid.vue";
import StarredMessagesPanel from "./StarredMessagesPanel.vue";
import { mutedUntilFor, MUTE_DURATIONS } from "../../muteDurations";
import { useChatStore, upsertMessage } from "../../store";
import { chatableKey, chatableKeyOf } from "../../chatable";
import { useUsers } from "../../composables/useUsers";
import { useParticipants } from "../../composables/useParticipants";
import { useBlockedUsers } from "../../composables/useBlockedUsers";
import { useConversations } from "../../composables/useConversations";
import { useMessages } from "../../composables/useMessages";
import WallpaperPicker from "../shared/WallpaperPicker.vue";

const props = defineProps({
    conversation: { type: Object, required: true },
});

const emit = defineEmits(["close"]);

const store = useChatStore();
const { resolve, get } = useUsers();
const { add, remove, changeRole } = useParticipants();
const { block, unblock, isBlocked } = useBlockedUsers();
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
const { clear: clearMessages, media: fetchMedia } = useMessages();

const showAddMember = ref(false);
const picked = ref([]);
const error = ref("");
const showMedia = ref(false);
const showStarred = ref(false);

function onJumpToStarred() {
    showStarred.value = false;
    emit("close");
}
const clearing = ref(false);
const cleared = ref(false);
const avatarUploading = ref(false);
const avatarError = ref("");
const previewMedia = ref([]);
const viewerIndex = ref(null);

// The full participant roster already arrives with the conversation payload — there's no
// separate endpoint to page through — so "lazy" here means revealing it progressively (a "Show
// more" button) rather than rendering a potentially large group's entire member list at once.
const PARTICIPANTS_PAGE_SIZE = 10;
const visibleParticipantCount = ref(PARTICIPANTS_PAGE_SIZE);

const visibleParticipants = computed(() =>
    (props.conversation.participants ?? []).slice(
        0,
        visibleParticipantCount.value,
    ),
);
const hasMoreParticipants = computed(
    () =>
        visibleParticipantCount.value <
        (props.conversation.participants?.length ?? 0),
);

function revealMoreParticipants() {
    visibleParticipantCount.value += PARTICIPANTS_PAGE_SIZE;
}

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
        ? isBlocked({ type: row.chatable_type, id: row.chatable_id })
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
    return store.presenceByUser[
        chatableKey(row.chatable_type, row.chatable_id)
    ];
});

const subLabel = computed(() => {
    if (isGroup.value) {
        const count = props.conversation.participants?.length ?? 0;
        return `${count} participant${count === 1 ? "" : "s"}`;
    }
    if (otherPresence.value?.is_online) return "online";
    if (otherPresence.value?.last_seen_at) {
        const diffMs =
            Date.now() - new Date(otherPresence.value.last_seen_at).getTime();
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
    await mute(
        props.conversation.id,
        isMuted.value ? null : mutedUntilFor("always"),
    );
}

async function loadPreviewMedia() {
    const response = await fetchMedia("media", props.conversation.id, 1);
    previewMedia.value = response.data
        .filter((m) => !m.deleted_for_everyone)
        .flatMap((m) =>
            (m.attachments ?? []).map((a) => ({ ...a, kind: m.type })),
        )
        .slice(0, 6);
}

async function loadAll() {
    visibleParticipantCount.value = PARTICIPANTS_PAGE_SIZE;

    const refs = (props.conversation.participants ?? []).map((p) => ({
        type: p.chatable_type,
        id: p.chatable_id,
    }));
    if (refs.length) await resolve(refs);

    await loadPreviewMedia();
}

onMounted(loadAll);
watch(() => props.conversation.id, loadAll);

function openMediaTile(index) {
    viewerIndex.value = index;
}

async function addMembers() {
    error.value = "";
    try {
        // Nothing else inserts this locally — the backend broadcast excludes the actor's own
        // socket (mirroring how a sent message's own author doesn't wait on their own
        // broadcast either), so without this the "X added Y" system message wouldn't show up
        // for the person doing the adding until their next reload.
        const { message } = await add(props.conversation.id, picked.value);
        if (message) upsertMessage(props.conversation.id, message);
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
        const { message } = await remove(
            props.conversation.id,
            participant.chatable_type,
            participant.chatable_id,
        );
        if (message) upsertMessage(props.conversation.id, message);
        await refreshOne(props.conversation.id);
    } catch (e) {
        error.value = e.response?.data?.message ?? "Could not remove member.";
    }
}

async function toggleAdmin(participant) {
    error.value = "";
    try {
        const { message } = await changeRole(
            props.conversation.id,
            participant.chatable_type,
            participant.chatable_id,
            participant.role === "admin" ? "member" : "admin",
        );
        if (message) upsertMessage(props.conversation.id, message);
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

async function onPickWallpaper(value) {
    await setWallpaper(props.conversation.id, value);
}

async function toggleBlockOther() {
    const row = otherParticipantRow.value;
    if (!row) return;

    if (isOtherBlocked.value) {
        await unblock(row.chatable_type, row.chatable_id);
    } else {
        await block({ type: row.chatable_type, id: row.chatable_id });
    }
}

const muteMenuRoot = ref(null);
const showMuteMenu = ref(false);
const { opened: muteMenuOpened, closed: muteMenuClosed } =
    useExclusiveDropdown();
const {
    openUp: muteMenuUp,
    maxHeight: muteMenuMaxHeight,
    place: placeMuteMenu,
} = useDropdownPlacement();

function toggleMuteMenu() {
    if (isMuted.value) {
        onUnmute();
        return;
    }
    if (!showMuteMenu.value)
        placeMuteMenu(muteMenuRoot.value, { preferredHeight: 320 });
    showMuteMenu.value = !showMuteMenu.value;
}

function closeMuteMenu() {
    showMuteMenu.value = false;
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

const muteHint = computed(() => {
    if (!isMuted.value || !props.conversation.me?.muted_until) return null;
    return `Muted until ${new Date(
        props.conversation.me.muted_until,
    ).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
    })}`;
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
        class="cv-group-info-panel cv-animate-panel-in fixed inset-0 z-40 flex w-full flex-col bg-converse-surface md:absolute md:inset-y-0 md:left-auto md:right-0 md:w-[330px] md:shadow-2xl md:border-l md:border-converse-border lg:relative lg:z-auto lg:shrink-0 lg:shadow-none"
    >
        <SidebarScreenHeader
            :title="isGroup ? 'Group info' : 'Contact info'"
            @back="emit('close')"
        />

        <div class="cv-scroll min-h-0 flex-1 overflow-y-auto pb-8">
            <div
                class="cv-group-info-panel__avatar flex flex-col items-center gap-3 border-b border-converse-border px-[22px] py-[26px] text-center"
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
                    <p
                        class="font-display text-[21px] font-normal text-converse-text"
                    >
                        {{ displayName }}
                    </p>
                    <p
                        v-if="subLabel"
                        class="mt-1 text-[12.5px] text-converse-textMuted"
                    >
                        {{ subLabel }}
                    </p>
                    <p
                        v-if="conversation.description"
                        class="mt-1 px-4 text-center text-sm text-converse-textMuted"
                    >
                        {{ conversation.description }}
                    </p>
                </div>
            </div>

            <div class="border-b border-converse-border px-[22px] py-5">
                <div class="mb-3 flex items-baseline justify-between gap-2.5">
                    <h3
                        class="text-[11.5px] font-bold uppercase tracking-[.08em] text-converse-textDim"
                    >
                        Shared media
                    </h3>
                    <button
                        type="button"
                        class="text-[12.5px] font-semibold text-converse-accentText hover:underline"
                        @click="showMedia = true"
                    >
                        See all
                    </button>
                </div>
                <div
                    v-if="previewMedia.length"
                    class="grid grid-cols-3 gap-[7px]"
                >
                    <button
                        v-for="(item, i) in previewMedia"
                        :key="item.id"
                        type="button"
                        :title="item.original_filename"
                        class="group relative aspect-square overflow-hidden rounded-[14px] bg-converse-surfaceHover"
                        @click="openMediaTile(i)"
                    >
                        <video
                            v-if="item.kind === 'video'"
                            :src="item.url"
                            class="h-full w-full object-cover"
                            muted
                        />
                        <img
                            v-else
                            :src="item.thumbnail_url || item.url"
                            :alt="item.original_filename"
                            class="h-full w-full object-cover"
                        />
                        <span
                            v-if="item.original_filename"
                            class="absolute bottom-1 right-1 max-w-[calc(100%-20px)] truncate rounded-md bg-converse-surface/85 px-1.5 py-0.5 text-[9px] font-medium text-converse-textMuted"
                            >{{ item.original_filename }}</span
                        >
                    </button>
                </div>
                <p v-else class="text-xs text-converse-textMuted">
                    No media yet.
                </p>
            </div>

            <div class="border-b border-converse-border px-[22px] py-5">
                <h3
                    class="mb-3 text-[11.5px] font-bold uppercase tracking-[.08em] text-converse-textDim"
                >
                    Chat wallpaper
                </h3>
                <WallpaperPicker
                    :model-value="conversation.me?.wallpaper"
                    @update:model-value="onPickWallpaper"
                />
            </div>

            <template v-if="isGroup">
                <div class="border-b border-converse-border px-[10px] py-5">
                    <div
                        class="mb-2.5 mx-3 flex items-baseline justify-between gap-2.5"
                    >
                        <h3
                            class="text-[11.5px] font-bold uppercase tracking-[.08em] text-converse-textDim"
                        >
                            {{ conversation.participants?.length ?? 0 }}
                            participants
                        </h3>
                        <button
                            v-if="isAdmin"
                            type="button"
                            class="text-[12.5px] font-semibold text-converse-accentText hover:underline"
                            @click="showAddMember = true"
                        >
                            Add
                        </button>
                    </div>

                    <div class="flex flex-col gap-0.5">
                        <div
                            v-for="participant in visibleParticipants"
                            :key="chatableKeyOf(participant)"
                            class="group flex items-center gap-[11px] rounded-2xl pl-3 pr-5 py-2 hover:bg-converse-surfaceHover"
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
                                :size="34"
                            />
                            <div class="min-w-0 flex-1">
                                <p
                                    class="truncate text-[13.5px] font-medium text-converse-text"
                                >
                                    {{
                                        get({
                                            type: participant.chatable_type,
                                            id: participant.chatable_id,
                                        }).name
                                    }}
                                </p>
                                <p
                                    v-if="participant.role === 'admin'"
                                    class="text-[11px] text-converse-textDim"
                                >
                                    Admin
                                </p>
                            </div>
                            <div
                                v-if="isAdmin && !isMe(participant)"
                                class="flex shrink-0 items-center gap-2.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                            >
                                <button
                                    type="button"
                                    class="text-[11.5px] font-semibold text-converse-sage hover:underline"
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
                                    class="text-[11.5px] font-semibold text-converse-accentText hover:underline"
                                    @click="removeMember(participant)"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                        <button
                            v-if="hasMoreParticipants"
                            type="button"
                            class="mt-1 rounded-2xl px-3 py-2 text-left text-[13px] font-semibold text-converse-accentText hover:bg-converse-surfaceHover"
                            @click="revealMoreParticipants"
                        >
                            Show more
                        </button>
                    </div>
                </div>
            </template>

            <p
                v-if="error"
                class="cv-group-info-panel__error mx-[10px] mt-3 rounded bg-converse-danger/10 p-2 text-xs text-converse-danger"
            >
                {{ error }}
            </p>

            <div class="flex flex-col gap-0.5 px-[10px] py-5">
                <button
                    type="button"
                    class="flex items-center gap-4 rounded-2xl px-3.5 py-3 text-left text-[13.5px] font-medium text-converse-text hover:bg-converse-surfaceHover"
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
                    <span>{{
                        isFavourite
                            ? "Remove from favourites"
                            : "Add to favourites"
                    }}</span>
                </button>

                <button
                    type="button"
                    class="flex items-center gap-4 rounded-2xl px-3.5 py-3 text-left text-[13.5px] font-medium text-converse-text hover:bg-converse-surfaceHover"
                    @click="showStarred = true"
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
                    <span>Starred messages</span>
                </button>

                <button
                    type="button"
                    class="flex items-center gap-4 rounded-2xl px-3.5 py-3 text-left text-[13.5px] font-medium text-converse-accentText hover:bg-converse-surfaceHover disabled:opacity-50"
                    :disabled="clearing"
                    @click="onClearChat"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="shrink-0 text-converse-accentText"
                    >
                        <path
                            d="M15 4V3H9v1H4v2h16V4h-5ZM6 8l1 12h10l1-12H6Z"
                        />
                    </svg>
                    <span>{{ cleared ? "Chat cleared" : "Clear chat" }}</span>
                </button>

                <button
                    v-if="!isGroup"
                    type="button"
                    class="flex items-center gap-4 rounded-2xl px-3.5 py-3 text-left text-[13.5px] font-medium text-converse-accentText hover:bg-converse-surfaceHover"
                    @click="toggleBlockOther"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="shrink-0 text-converse-accentText"
                    >
                        <path
                            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.94 7.94 0 0 1 4 12a8 8 0 0 1 8-8Zm0 16c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.94 7.94 0 0 1 20 12a8 8 0 0 1-8 8Z"
                        />
                    </svg>
                    <span
                        >{{ isOtherBlocked ? "Unblock" : "Block" }}
                        {{ otherParticipant?.name }}</span
                    >
                </button>
                <button
                    v-else
                    type="button"
                    class="flex items-center gap-4 rounded-2xl px-3.5 py-3 text-left text-[13.5px] font-medium text-converse-accentText hover:bg-converse-surfaceHover"
                    @click="leaveGroup"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="shrink-0 text-converse-accentText"
                    >
                        <path
                            d="M10 3v2H5v14h5v2H3V3h7Zm5.29 3.71L18.59 10H8v2h10.59l-3.3 3.29 1.42 1.42L22 11.41l-5.29-5.3-1.42 1.6Z"
                        />
                    </svg>
                    <span>Leave group</span>
                </button>

                <button
                    type="button"
                    class="flex items-center gap-4 rounded-2xl px-3.5 py-3 text-left text-[13.5px] font-medium text-converse-accentText hover:bg-converse-surfaceHover"
                    @click="onDeleteChat"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="shrink-0 text-converse-accentText"
                    >
                        <path
                            d="M9 3v1H4v2h16V4h-5V3H9Zm-3 6 1 12h10l1-12H6Z"
                        />
                    </svg>
                    <span>Delete chat</span>
                </button>
            </div>

            <div
                ref="muteMenuRoot"
                class="relative mx-[10px] flex flex-col gap-0.5 border-t border-converse-border py-3.5"
            >
                <div
                    class="flex cursor-pointer items-center gap-3.5 rounded-[20px] px-4 py-[15px] hover:bg-converse-surfaceHover"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="shrink-0"
                        :class="
                            isMuted
                                ? 'text-converse-sage'
                                : 'text-converse-textMuted'
                        "
                    >
                        <path
                            d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6-1.6-1.6V10a5.4 5.4 0 0 0-4.5-5.32V3.5a1 1 0 1 0-2 0v1.18A5.4 5.4 0 0 0 6.4 10v4.4L4.8 16v1h14.4v-1Z"
                        />
                        <path
                            v-if="isMuted"
                            d="M3.5 3.5l17 17"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            fill="none"
                        />
                    </svg>
                    <button
                        type="button"
                        class="flex-1 text-left"
                        @click="toggleMuteMenu"
                    >
                        <span
                            class="block text-[13.5px] font-medium text-converse-text"
                            >Mute notifications</span
                        >
                        <span
                            v-if="muteHint"
                            class="mt-0.5 block text-xs text-converse-textMuted"
                            >{{ muteHint }}</span
                        >
                    </button>
                    <button
                        type="button"
                        class="relative h-[27px] w-[46px] shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-converse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-converse-surface"
                        :class="
                            isMuted ? 'bg-converse-sage' : 'bg-converse-border'
                        "
                        role="switch"
                        :aria-checked="isMuted"
                        @click="toggleMuteMenu"
                    >
                        <span
                            class="absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow transition-[left] duration-150 ease-out"
                            :class="isMuted ? 'left-[22px]' : 'left-[3px]'"
                        />
                    </button>
                </div>

                <div
                    v-if="showMuteMenu"
                    class="cv-animate-pop-in absolute right-4 z-20"
                    :class="muteMenuUp ? 'bottom-full mb-1' : 'top-full mt-1'"
                >
                    <div
                        class="w-48 overflow-y-auto rounded-[22px] border border-converse-border bg-converse-surface p-2 shadow-lg"
                        :style="{ maxHeight: muteMenuMaxHeight + 'px' }"
                    >
                        <p
                            class="px-3.5 pb-1 pt-2 text-xs font-medium uppercase text-converse-textMuted"
                        >
                            Mute for
                        </p>
                        <button
                            v-for="option in MUTE_DURATIONS"
                            :key="option.key"
                            type="button"
                            class="block w-full rounded-full px-3.5 py-2.5 text-left text-sm text-converse-text hover:bg-converse-surfaceHover"
                            @click="onPickMuteDuration(option.key)"
                        >
                            {{ option.label }}
                        </button>
                    </div>
                </div>

                <DisappearingToggle :conversation="conversation" />
            </div>
        </div>

        <div
            v-if="showAddMember"
            class="absolute inset-0 z-10 flex flex-col bg-converse-surface"
        >
            <SidebarScreenHeader
                title="Add participants"
                @back="closeAddMember"
            />
            <div class="flex min-h-0 flex-1 flex-col">
                <UserPicker
                    v-model="picked"
                    :multiple="true"
                    :exclude="currentParticipantRefs"
                    class="min-h-0 flex-1"
                />
                <p
                    v-if="error"
                    class="shrink-0 px-4 pb-2 text-xs text-converse-danger"
                >
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
            />
            <MediaDocsLinksGrid
                :conversation-id="conversation.id"
                class="flex-1"
            />
        </div>

        <div
            v-if="showStarred"
            class="absolute inset-0 z-10 flex flex-col bg-converse-surface"
        >
            <StarredMessagesPanel
                :conversation-id="conversation.id"
                @back="showStarred = false"
                @jump="onJumpToStarred"
            />
        </div>

        <MediaViewerModal
            v-if="viewerIndex !== null"
            :items="previewMedia"
            :index="viewerIndex"
            @close="viewerIndex = null"
        />
    </div>
</template>
