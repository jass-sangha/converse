<script setup>
import { computed, onMounted, ref } from "vue";
import Avatar from "../shared/Avatar.vue";
import BlockedUsersPanel from "./BlockedUsersPanel.vue";
import { useChatStore } from "../../store";
import { useProfile } from "../../composables/useProfile";
import { usePreferences } from "../../composables/usePreferences";
import { usePrivacySettings } from "../../composables/usePrivacySettings";

const store = useChatStore();
const { updateAvatar, removeAvatar } = useProfile();
const { theme, toggleTheme } = usePreferences();
const { get: getPrivacySettings, update: updatePrivacySettings } =
    usePrivacySettings();

const uploadError = ref("");
const uploading = ref(false);
const removingAvatar = ref(false);
const showLastSeen = ref(true);
const showReadReceipts = ref(true);
const showBlocked = ref(false);
const search = ref("");
const section = ref(null);
const about = ref("");
const savingAbout = ref(false);

const me = computed(() => store.usersById[store.currentKey] ?? null);

const ROWS = [
    {
        key: "profile",
        label: "Profile",
        hint: "Name, profile picture, username",
        path: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.87 0-8 1.95-8 5v2h16v-2c0-3.05-4.13-5-8-5Z",
    },
    // {
    //     key: 'account',
    //     label: 'Account',
    //     hint: 'Security notifications, account info',
    //     path: 'M14 2a5 5 0 0 0-4.9 6.1L2 15.2V19h3.8l1-1h2v-2h2l2.6-2.6A5 5 0 1 0 14 2Zm2 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z',
    // },
    {
        key: "privacy",
        label: "Privacy",
        hint: "Blocked contacts, disappearing messages",
        path: "M12 1a4 4 0 0 0-4 4v3H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm-2 7V5a2 2 0 1 1 4 0v3Z",
    },
    {
        key: "chats",
        label: "Chats",
        hint: "Theme, wallpaper, chat settings",
        path: "M12 2C6.48 2 2 6.03 2 11c0 2.4 1.05 4.58 2.77 6.2-.15 1.34-.72 2.55-1.55 3.5a.5.5 0 0 0 .5.8c1.9-.32 3.55-1.18 4.86-2.27C9.5 19.72 10.72 20 12 20c5.52 0 10-4.03 10-9s-4.48-9-10-9Z",
    },
    {
        key: "notifications",
        label: "Notifications",
        hint: "Messages, groups, sounds",
        path: "M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6-1.6-1.6V10a5.4 5.4 0 0 0-4.5-5.32V3.5a1 1 0 1 0-2 0v1.18A5.4 5.4 0 0 0 6.4 10v4.4L4.8 16v1h14.4v-1Z",
    },
    {
        key: "shortcuts",
        label: "Keyboard shortcuts",
        hint: "Speed up your workflow",
        path: "M4 6h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm1 3v2h2V9H5Zm4 0v2h2V9H9Zm4 0v2h2V9h-2Zm4 0v2h2V9h-2ZM5 13v2h2v-2H5Zm4 0v2h6v-2H9Zm8 0v2h2v-2h-2Z",
    },
];

const filteredRows = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return ROWS;
    return ROWS.filter(
        (row) =>
            row.label.toLowerCase().includes(q) ||
            row.hint.toLowerCase().includes(q),
    );
});

const sectionTitle = computed(
    () => ROWS.find((row) => row.key === section.value)?.label ?? "",
);

onMounted(async () => {
    const settings = await getPrivacySettings();
    showLastSeen.value = settings.show_last_seen;
    showReadReceipts.value = settings.show_read_receipts;
    about.value = settings.about ?? "";
});

async function onFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadError.value = "";
    uploading.value = true;

    try {
        await updateAvatar(file);
    } catch (e) {
        uploadError.value =
            e.response?.data?.message ?? "Could not update photo.";
    } finally {
        uploading.value = false;
        event.target.value = "";
    }
}

async function onRemoveAvatar() {
    uploadError.value = "";
    removingAvatar.value = true;
    try {
        await removeAvatar();
    } catch (e) {
        uploadError.value =
            e.response?.data?.message ?? "Could not remove photo.";
    } finally {
        removingAvatar.value = false;
    }
}

async function onAboutBlur() {
    savingAbout.value = true;
    try {
        await updatePrivacySettings({ about: about.value.trim() });
    } finally {
        savingAbout.value = false;
    }
}

async function onToggleLastSeen() {
    showLastSeen.value = !showLastSeen.value;
    await updatePrivacySettings({ show_last_seen: showLastSeen.value });
}

async function onToggleReadReceipts() {
    showReadReceipts.value = !showReadReceipts.value;
    await updatePrivacySettings({ show_read_receipts: showReadReceipts.value });
}

function logout() {
    document.getElementById("cv-logout-form")?.submit();
}
</script>

<template>
    <div class="cv-settings-panel flex h-full flex-col bg-converse-surface">
        <template v-if="!section">
            <div class="cv-settings-panel__header px-4 py-3">
                <h1 class="text-xl font-bold text-converse-text">
                    {{ me?.name ?? "Settings" }}
                </h1>
                <p
                    v-if="about"
                    class="truncate text-sm text-converse-textMuted"
                >
                    {{ about }}
                </p>
            </div>

            <div class="cv-settings-panel__search px-3 pb-3">
                <div class="relative">
                    <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-converse-textMuted"
                    >
                        <path
                            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
                        />
                    </svg>
                    <input
                        v-model="search"
                        type="text"
                        placeholder="Search"
                        class="w-full rounded-lg bg-converse-surfaceHover py-2 pl-9 pr-3 text-sm text-converse-text focus:outline-none"
                    />
                </div>
            </div>

            <div
                class="cv-settings-panel__avatar flex flex-col items-center gap-3 pb-4"
            >
                <span
                    class="rounded-full bg-converse-surfaceHover px-3 py-1 text-xs text-converse-textMuted"
                    >Available</span
                >
                <label
                    class="cv-settings-panel__avatar-upload group relative cursor-pointer rounded-full"
                >
                    <Avatar
                        :name="me?.name ?? ''"
                        :avatar-url="me?.avatar_url"
                        :size="96"
                    />
                    <span
                        class="absolute inset-0 flex items-center justify-center rounded-full bg-converse-overlay/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-converse-overlay/40 group-hover:opacity-100"
                    >
                        {{ uploading ? "Uploading…" : "Change photo" }}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        :disabled="uploading"
                        @change="onFileChange"
                    />
                </label>
                <button
                    v-if="me?.avatar_url"
                    type="button"
                    class="text-xs text-converse-danger disabled:opacity-50"
                    :disabled="removingAvatar"
                    @click="onRemoveAvatar"
                >
                    {{ removingAvatar ? "Removing…" : "Remove photo" }}
                </button>
                <p
                    v-if="uploadError"
                    class="cv-settings-panel__avatar-error text-xs text-converse-danger"
                >
                    {{ uploadError }}
                </p>
            </div>

            <div
                class="cv-settings-panel__rows flex-1 overflow-y-auto border-t border-converse-border"
            >
                <button
                    v-for="row in filteredRows"
                    :key="row.key"
                    type="button"
                    class="cv-settings-panel__row flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-converse-surfaceHover"
                    @click="section = row.key"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="shrink-0 text-converse-textMuted"
                    >
                        <path :d="row.path" />
                    </svg>
                    <span class="min-w-0">
                        <span class="block text-[15px] text-converse-text">{{
                            row.label
                        }}</span>
                        <span
                            class="block truncate text-xs text-converse-textMuted"
                            >{{ row.hint }}</span
                        >
                    </span>
                </button>

                <button
                    type="button"
                    class="cv-settings-panel__logout flex w-full items-center gap-4 px-4 py-3 text-left text-converse-danger hover:bg-converse-surfaceHover"
                    @click="logout"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="shrink-0"
                    >
                        <path
                            d="M10 3v2H5v14h5v2H3V3h7Zm5.29 3.71L18.59 10H8v2h10.59l-3.3 3.29 1.42 1.42L22 11.41l-5.29-5.3-1.42 1.6Z"
                        />
                    </svg>
                    <span class="text-[15px]">Log out</span>
                </button>
            </div>
        </template>

        <template v-else>
            <div
                class="cv-settings-panel__section-header flex items-center gap-3 border-b border-converse-border px-3 py-3"
            >
                <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
                    @click="section = null"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                    >
                        <path
                            d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20Z"
                        />
                    </svg>
                </button>
                <h2 class="text-lg font-semibold text-converse-text">
                    {{ sectionTitle }}
                </h2>
            </div>

            <div
                class="cv-settings-panel__section-body flex-1 overflow-y-auto p-4"
            >
                <template v-if="section === 'profile'">
                    <div class="mb-6 flex flex-col items-center gap-2">
                        <label
                            class="group relative cursor-pointer rounded-full"
                        >
                            <Avatar
                                :name="me?.name ?? ''"
                                :avatar-url="me?.avatar_url"
                                :size="120"
                            />
                            <span
                                class="absolute inset-0 flex items-center justify-center rounded-full text-xs font-medium text-white opacity-0 transition group-hover:bg-converse-overlay/40 group-hover:opacity-100"
                            >
                                {{ uploading ? "Uploading…" : "Change photo" }}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                class="hidden"
                                :disabled="uploading"
                                @change="onFileChange"
                            />
                        </label>
                        <button
                            v-if="me?.avatar_url"
                            type="button"
                            class="text-xs text-converse-danger disabled:opacity-50"
                            :disabled="removingAvatar"
                            @click="onRemoveAvatar"
                        >
                            {{ removingAvatar ? "Removing…" : "Remove photo" }}
                        </button>
                        <p
                            v-if="uploadError"
                            class="text-xs text-converse-danger"
                        >
                            {{ uploadError }}
                        </p>
                    </div>
                    <div
                        class="mb-3 rounded-cv border border-converse-border p-3"
                    >
                        <p class="text-xs text-converse-textMuted">Your name</p>
                        <p class="text-[15px] text-converse-text">
                            {{ me?.name ?? "—" }}
                        </p>
                    </div>
                    <div class="rounded-cv border border-converse-border p-3">
                        <p class="mb-1 text-xs text-converse-textMuted">
                            About
                        </p>
                        <input
                            v-model="about"
                            type="text"
                            maxlength="139"
                            placeholder="Add a few words about yourself"
                            class="w-full bg-transparent text-[15px] text-converse-text focus:outline-none"
                            :disabled="savingAbout"
                            @blur="onAboutBlur"
                            @keyup.enter="$event.target.blur()"
                        />
                    </div>
                </template>

                <template v-else-if="section === 'privacy'">
                    <div class="mb-3 rounded-cv border border-converse-border">
                        <div
                            class="flex items-center justify-between border-b border-converse-border p-3"
                        >
                            <span class="text-sm text-converse-text"
                                >Show my last seen &amp; online status</span
                            >
                            <button
                                type="button"
                                class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-converse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-converse-surface"
                                :class="
                                    showLastSeen
                                        ? 'bg-converse-accent'
                                        : 'bg-converse-border'
                                "
                                role="switch"
                                :aria-checked="showLastSeen"
                                @click="onToggleLastSeen"
                            >
                                <span
                                    class="absolute top-0.5 h-5 w-5 rounded-full bg-converse-accentContrast shadow transition-transform"
                                    :class="
                                        showLastSeen
                                            ? 'translate-x-5'
                                            : 'translate-x-0.5'
                                    "
                                />
                            </button>
                        </div>
                        <div class="flex items-center justify-between p-3">
                            <span class="text-sm text-converse-text"
                                >Show my read receipts</span
                            >
                            <button
                                type="button"
                                class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-converse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-converse-surface"
                                :class="
                                    showReadReceipts
                                        ? 'bg-converse-accent'
                                        : 'bg-converse-border'
                                "
                                role="switch"
                                :aria-checked="showReadReceipts"
                                @click="onToggleReadReceipts"
                            >
                                <span
                                    class="absolute top-0.5 h-5 w-5 rounded-full bg-converse-accentContrast shadow transition-transform"
                                    :class="
                                        showReadReceipts
                                            ? 'translate-x-5'
                                            : 'translate-x-0.5'
                                    "
                                />
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="w-full rounded-cv border border-converse-border p-3 text-left text-sm text-converse-text hover:bg-converse-surfaceHover"
                        @click="showBlocked = true"
                    >
                        Blocked contacts
                    </button>
                </template>

                <template v-else-if="section === 'chats'">
                    <div
                        class="flex items-center justify-between rounded-cv border border-converse-border p-3"
                    >
                        <span class="text-sm text-converse-text"
                            >Dark mode</span
                        >
                        <button
                            type="button"
                            class="relative h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-converse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-converse-surface"
                            :class="
                                theme === 'dark'
                                    ? 'bg-converse-accent'
                                    : 'bg-converse-border'
                            "
                            role="switch"
                            :aria-checked="theme === 'dark'"
                            @click="toggleTheme"
                        >
                            <span
                                class="absolute top-0.5 h-5 w-5 rounded-full bg-converse-accentContrast shadow transition-transform"
                                :class="
                                    theme === 'dark'
                                        ? 'translate-x-5'
                                        : 'translate-x-0.5'
                                "
                            />
                        </button>
                    </div>
                    <p class="mt-3 text-xs text-converse-textMuted">
                        Per-chat wallpaper can be changed from that chat's info
                        panel.
                    </p>
                </template>

                <template v-else>
                    <p class="text-sm text-converse-textMuted">
                        This setting isn't available yet.
                    </p>
                </template>
            </div>
        </template>

        <BlockedUsersPanel v-if="showBlocked" @close="showBlocked = false" />
    </div>
</template>
