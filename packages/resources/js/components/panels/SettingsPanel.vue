<script setup>
import { computed, onMounted, ref } from "vue";
import Avatar from "../shared/Avatar.vue";
import SettingRow from "../shared/SettingRow.vue";
import UserPicker from "../shared/UserPicker.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import { useChatStore } from "../../store";
import { useProfile } from "../../composables/useProfile";
import { usePreferences } from "../../composables/usePreferences";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { usePrivacySettings } from "../../composables/usePrivacySettings";
import { useNotifications } from "../../composables/useNotifications";
import { useBlockedUsers } from "../../composables/useBlockedUsers";
import { useUsers } from "../../composables/useUsers";
import { mutedUntilFor, MUTE_DURATIONS } from "../../muteDurations";

const store = useChatStore();
const { muteAll } = useNotifications();
const { updateAvatar, removeAvatar } = useProfile();
const { theme, setTheme } = usePreferences();
const { setView } = useSidebarUi();
const { get: getPrivacySettings, update: updatePrivacySettings } =
    usePrivacySettings();
const { list: listBlocked, block, unblock } = useBlockedUsers();
const { resolve: resolveUsers, get: getUser } = useUsers();

const uploadError = ref("");
const uploading = ref(false);
const removingAvatar = ref(false);
const lastSeenHidden = ref(false);
const lastSeenHiddenUntil = ref(null);
const readReceiptsHidden = ref(false);
const readReceiptsHiddenUntil = ref(null);
const about = ref("");
const savingAbout = ref(false);
const mutedScopes = ref({ private: false, group: false });
const mutedUntil = ref({ private: null, group: null });

const blockedRows = ref([]);
const loadingBlocked = ref(true);
const showAddBlock = ref(false);
const picked = ref([]);

const THEME_OPTIONS = [
    {
        key: "light",
        label: "Light",
        hint: "Always use the light theme",
        swatch: "bg-[#f5ead8]",
    },
    {
        key: "dark",
        label: "Dark",
        hint: "Always use the dark theme",
        swatch: "bg-[#2e2b25]",
    },
    {
        key: "system",
        label: "System",
        hint: "Match your device's appearance",
        swatch: "bg-[linear-gradient(90deg,#f5ead8_50%,#2e2b25_50%)]",
    },
];

const me = computed(() => store.usersById[store.currentKey] ?? null);

function offHint(iso) {
    if (!iso) return "Turned off until you turn it back on";
    const date = new Date(iso);
    const farFuture =
        date.getTime() - Date.now() > 1000 * 60 * 60 * 24 * 365 * 2;
    if (farFuture) return "Turned off until you turn it back on";
    const day = date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
    const time = date
        .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
        .toLowerCase();
    return `Turned off till ${day} · ${time}`;
}

function applyPrivacySettings(settings) {
    lastSeenHidden.value = !settings.show_last_seen;
    lastSeenHiddenUntil.value = settings.last_seen_hidden_until ?? null;
    readReceiptsHidden.value = !settings.show_read_receipts;
    readReceiptsHiddenUntil.value = settings.read_receipts_hidden_until ?? null;
}

async function refreshBlocked() {
    loadingBlocked.value = true;
    const rows = await listBlocked();
    blockedRows.value = rows;
    await resolveUsers(
        rows.map((r) => ({ type: r.blocked_type, id: r.blocked_id })),
    );
    loadingBlocked.value = false;
}

onMounted(async () => {
    const settings = await getPrivacySettings();
    applyPrivacySettings(settings);
    about.value = settings.about ?? "";
    await refreshBlocked();
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

async function onShowLastSeen() {
    const settings = await updatePrivacySettings({
        show_last_seen: true,
        last_seen_hidden_until: null,
    });
    applyPrivacySettings(settings);
}

async function onHideLastSeen(option) {
    const settings = await updatePrivacySettings({
        show_last_seen: true,
        last_seen_hidden_until: mutedUntilFor(option.key),
    });
    applyPrivacySettings(settings);
}

async function onShowReadReceipts() {
    const settings = await updatePrivacySettings({
        show_read_receipts: true,
        read_receipts_hidden_until: null,
    });
    applyPrivacySettings(settings);
}

async function onHideReadReceipts(option) {
    const settings = await updatePrivacySettings({
        show_read_receipts: true,
        read_receipts_hidden_until: mutedUntilFor(option.key),
    });
    applyPrivacySettings(settings);
}

async function onUnmuteAll(scope) {
    await muteAll(scope, null);
    mutedScopes.value[scope] = false;
    mutedUntil.value[scope] = null;
}

async function onMuteAll(scope, durationKey) {
    const until = mutedUntilFor(durationKey);
    await muteAll(scope, until);
    mutedScopes.value[scope] = true;
    mutedUntil.value[scope] = until;
}

async function onUnblock(row) {
    await unblock(row.blocked_type, row.blocked_id);
    await refreshBlocked();
}

async function addBlock() {
    if (!picked.value.length) return;
    await Promise.all(picked.value.map((user) => block(user)));
    picked.value = [];
    showAddBlock.value = false;
    await refreshBlocked();
}
</script>

<template>
    <div class="cv-settings-panel flex h-full flex-col bg-converse-surface">
        <SidebarScreenHeader title="You" @back="setView('chats')">
            <GlobalMenu />
        </SidebarScreenHeader>

        <div class="cv-scroll flex-1 overflow-y-auto px-4 pb-5">
            <div
                class="flex items-start gap-3.5 rounded-[24px] bg-converse-railBg p-4"
            >
                <label
                    class="group relative shrink-0 cursor-pointer rounded-full"
                >
                    <Avatar
                        :name="me?.name ?? ''"
                        :avatar-url="me?.avatar_url"
                        :size="52"
                    />
                    <span
                        class="absolute inset-0 flex items-center justify-center rounded-full bg-converse-overlay/0 text-[10px] font-medium text-white opacity-0 transition group-hover:bg-converse-overlay/40 group-hover:opacity-100"
                    >
                        {{ uploading ? "…" : "Edit" }}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        :disabled="uploading"
                        @change="onFileChange"
                    />
                </label>
                <div class="min-w-0 flex-1">
                    <div class="text-[15.5px] font-semibold text-converse-text">
                        {{ me?.name ?? "—" }}
                    </div>
                    <div class="mt-[3px] flex items-center gap-1.5">
                        <input
                            v-model="about"
                            type="text"
                            maxlength="139"
                            placeholder="Add a short description"
                            title="Click to edit your description"
                            class="h-[30px] min-w-0 flex-1 -ml-[11px] rounded-full border border-transparent bg-transparent px-[11px] text-[12.5px] text-converse-textMuted outline-none hover:border-converse-border hover:bg-converse-surface focus:border-converse-accent focus:bg-converse-surface focus:text-converse-text"
                            :disabled="savingAbout"
                            @blur="onAboutBlur"
                            @keyup.enter="$event.target.blur()"
                        />
                        <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.75"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="shrink-0 text-converse-textDim"
                        >
                            <path d="M4 20h4L20 8l-4-4L4 16v4Z" />
                        </svg>
                    </div>
                    <button
                        v-if="me?.avatar_url"
                        type="button"
                        class="mt-1 text-xs text-converse-danger disabled:opacity-50"
                        :disabled="removingAvatar"
                        @click="onRemoveAvatar"
                    >
                        {{ removingAvatar ? "Removing…" : "Remove photo" }}
                    </button>
                    <p
                        v-if="uploadError"
                        class="mt-1 text-xs text-converse-danger"
                    >
                        {{ uploadError }}
                    </p>
                </div>
            </div>

            <div
                class="px-1.5 pb-1 pt-[18px] text-[11.5px] font-bold uppercase tracking-wide text-converse-textDim"
            >
                Privacy
            </div>
            <SettingRow
                label="Enable last seen &amp; online status"
                :hint="
                    !lastSeenHidden
                        ? 'Visible to everyone'
                        : offHint(lastSeenHiddenUntil)
                "
                :is-on="!lastSeenHidden"
                :options="MUTE_DURATIONS"
                menu-title="Turn off for"
                @toggle="onShowLastSeen"
                @pick="onHideLastSeen"
            />
            <SettingRow
                label="Enable read receipts"
                :hint="
                    !readReceiptsHidden
                        ? 'Visible to everyone'
                        : offHint(readReceiptsHiddenUntil)
                "
                :is-on="!readReceiptsHidden"
                :options="MUTE_DURATIONS"
                menu-title="Turn off for"
                @toggle="onShowReadReceipts"
                @pick="onHideReadReceipts"
            />

            <div
                class="px-1.5 pb-1 pt-[18px] text-[11.5px] font-bold uppercase tracking-wide text-converse-textDim"
            >
                Notifications
            </div>
            <SettingRow
                label="Individual chats"
                :hint="
                    !mutedScopes.private
                        ? 'Alerts on for these chats'
                        : offHint(mutedUntil.private)
                "
                :is-on="!mutedScopes.private"
                :options="MUTE_DURATIONS"
                menu-title="Turn off for"
                @toggle="onUnmuteAll('private')"
                @pick="(option) => onMuteAll('private', option.key)"
            />
            <SettingRow
                label="Group chats"
                :hint="
                    !mutedScopes.group
                        ? 'Alerts on for these chats'
                        : offHint(mutedUntil.group)
                "
                :is-on="!mutedScopes.group"
                :options="MUTE_DURATIONS"
                menu-title="Turn off for"
                @toggle="onUnmuteAll('group')"
                @pick="(option) => onMuteAll('group', option.key)"
            />

            <div
                class="px-1.5 pb-1 pt-[18px] text-[11.5px] font-bold uppercase tracking-wide text-converse-textDim"
            >
                Theme
            </div>
            <div
                class="flex gap-1 rounded-full border border-converse-border bg-converse-surfaceHover p-1"
            >
                <button
                    v-for="option in THEME_OPTIONS"
                    :key="option.key"
                    type="button"
                    class="relative h-[38px] flex-1 rounded-full text-[12.5px] font-semibold text-converse-textMuted"
                    :title="option.hint"
                    role="radio"
                    :aria-checked="theme === option.key"
                    @click="setTheme(option.key)"
                >
                    <span
                        v-if="theme === option.key"
                        class="absolute inset-0 rounded-full bg-converse-accent shadow"
                    />
                    <span
                        class="relative flex items-center justify-center gap-1.5"
                        :class="
                            theme === option.key
                                ? 'text-converse-accentContrast'
                                : 'text-converse-textMuted'
                        "
                    >
                        <span
                            class="h-3.5 w-3.5 rounded-full border border-converse-border"
                            :class="option.swatch"
                        />
                        {{ option.label }}
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>
