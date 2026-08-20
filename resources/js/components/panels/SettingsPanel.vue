<script setup>
import { computed, onMounted, ref } from "vue";
import Avatar from "../shared/Avatar.vue";
import AvatarPhotoControl from "../shared/AvatarPhotoControl.vue";
import SettingRow from "../shared/SettingRow.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import WallpaperPicker from "../shared/WallpaperPicker.vue";
import Icon from "../shared/Icon.vue";
import { useChatStore } from "../../store";
import { useProfile } from "../../composables/useProfile";
import { usePreferences } from "../../composables/usePreferences";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { usePrivacySettings } from "../../composables/usePrivacySettings";
import { useNotifications } from "../../composables/useNotifications";
import { mutedUntilFor, MUTE_DURATIONS } from "../../muteDurations";

const store = useChatStore();
const { muteAll } = useNotifications();
const { updateAvatar, removeAvatar } = useProfile();
const { theme, setTheme, defaultWallpaper, setDefaultWallpaper } =
    usePreferences();
const { setView } = useSidebarUi();
const { get: getPrivacySettings, update: updatePrivacySettings } =
    usePrivacySettings();

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

onMounted(async () => {
    const settings = await getPrivacySettings();
    applyPrivacySettings(settings);
    about.value = settings.about ?? "";
});

async function onAvatarUpload(file) {
    uploadError.value = "";
    uploading.value = true;

    try {
        await updateAvatar(file);
    } catch (e) {
        uploadError.value =
            e.response?.data?.message ?? "Could not update photo.";
    } finally {
        uploading.value = false;
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
</script>

<template>
    <div class="chat-settings-panel flex h-full flex-col bg-riwaaq-surface">
        <SidebarScreenHeader title="You" @back="setView('chats')">
            <GlobalMenu />
        </SidebarScreenHeader>

        <div class="chat-scroll flex-1 overflow-y-auto px-4 pb-5">
            <div
                class="flex items-start gap-3.5 rounded-chat-lg bg-riwaaq-railBg p-4"
            >
                <AvatarPhotoControl
                    :name="me?.name ?? ''"
                    :avatar-url="me?.avatar_url"
                    :size="52"
                    :editable="true"
                    menu-align="left"
                    :uploading="uploading || removingAvatar"
                    @upload="onAvatarUpload"
                    @remove="onRemoveAvatar"
                />
                <div class="min-w-0 flex-1">
                    <div class="text-[15.5px] font-semibold text-riwaaq-text">
                        {{ me?.name ?? "—" }}
                    </div>
                    <div class="mt-[3px] flex items-center gap-1.5">
                        <input
                            v-model="about"
                            type="text"
                            maxlength="139"
                            placeholder="Add a short description"
                            title="Click to edit your description"
                            class="h-[30px] min-w-0 flex-1 -ml-[11px] rounded-full border border-transparent bg-transparent px-[11px] text-[12.5px] text-riwaaq-textMuted outline-none hover:border-riwaaq-border hover:bg-riwaaq-surface focus:border-riwaaq-accent focus:bg-riwaaq-surface focus:text-riwaaq-text"
                            :disabled="savingAbout"
                            @blur="onAboutBlur"
                            @keyup.enter="$event.target.blur()"
                        />
                            <Icon name="edit-outline" :size="14" class="shrink-0 text-riwaaq-textDim" />
                    </div>
                    <p
                        v-if="uploadError"
                        class="mt-1 text-xs text-riwaaq-danger"
                    >
                        {{ uploadError }}
                    </p>
                </div>
            </div>

            <div
                class="px-1.5 pb-1 pt-[18px] text-[11.5px] font-bold uppercase tracking-wide text-riwaaq-textDim"
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
                class="px-1.5 pb-1 pt-[18px] text-[11.5px] font-bold uppercase tracking-wide text-riwaaq-textDim"
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
                class="px-1.5 pb-1 pt-[18px] text-[11.5px] font-bold uppercase tracking-wide text-riwaaq-textDim"
            >
                Theme
            </div>
            <div
                class="flex gap-1 rounded-full border border-riwaaq-border bg-riwaaq-surfaceHover p-1 mx-3"
            >
                <button
                    v-for="option in THEME_OPTIONS"
                    :key="option.key"
                    type="button"
                    class="relative h-[38px] flex-1 rounded-full text-[12.5px] font-semibold text-riwaaq-textMuted"
                    :title="option.hint"
                    role="radio"
                    :aria-checked="theme === option.key"
                    @click="setTheme(option.key)"
                >
                    <span
                        v-if="theme === option.key"
                        class="absolute inset-0 rounded-full bg-riwaaq-accent shadow"
                    />
                    <span
                        class="relative flex items-center justify-center gap-1.5"
                        :class="
                            theme === option.key
                                ? 'text-riwaaq-accentContrast'
                                : 'text-riwaaq-textMuted'
                        "
                    >
                        <span
                            class="h-3.5 w-3.5 rounded-full border border-riwaaq-border"
                            :class="option.swatch"
                        />
                        {{ option.label }}
                    </span>
                </button>
            </div>

            <div
                class="px-1.5 pb-1 pt-[30px] text-[11.5px] font-bold uppercase tracking-wide text-riwaaq-textDim"
            >
                Default chat wallpaper
            </div>
            <p class="mx-3 mb-3 text-xs text-riwaaq-textMuted">
                Used for chats that don't have their own wallpaper set.
            </p>
            <div class="mx-3 mb-6">
                <WallpaperPicker
                    :model-value="defaultWallpaper"
                    @update:model-value="setDefaultWallpaper"
                />
            </div>

            <div
                class="chat-settings-branding select-none px-1.5 pb-4 pt-2 text-center text-[11px] text-riwaaq-textDim"
            >
                Powered by Riwaaq · riwaaq-pro
            </div>
        </div>
    </div>
</template>
