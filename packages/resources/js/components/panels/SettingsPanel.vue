<script setup>
import { computed, onMounted, ref } from 'vue';
import Avatar from '../shared/Avatar.vue';
import { useChatStore } from '../../store';
import { useProfile } from '../../composables/useProfile';
import { usePreferences } from '../../composables/usePreferences';
import { usePrivacySettings } from '../../composables/usePrivacySettings';
import { useResizable } from '../../composables/useResizable';

const emit = defineEmits(['close']);

const store = useChatStore();
const { updateAvatar } = useProfile();
const { theme, toggleTheme, settingsPanelWidth } = usePreferences();
const { startDrag } = useResizable(settingsPanelWidth, { invert: true });
const { get: getPrivacySettings, update: updatePrivacySettings } = usePrivacySettings();

const uploadError = ref('');
const uploading = ref(false);
const showLastSeen = ref(true);
const showReadReceipts = ref(true);

const me = computed(() => store.usersById[store.currentKey] ?? null);

onMounted(async () => {
    const settings = await getPrivacySettings();
    showLastSeen.value = settings.show_last_seen;
    showReadReceipts.value = settings.show_read_receipts;
});

async function onFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadError.value = '';
    uploading.value = true;

    try {
        await updateAvatar(file);
    } catch (e) {
        uploadError.value = e.response?.data?.message ?? 'Could not update photo.';
    } finally {
        uploading.value = false;
        event.target.value = '';
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
</script>

<template>
    <div
        class="cv-settings-panel fixed inset-0 z-40 overflow-y-auto bg-converse-surface p-4 sm:static sm:z-auto sm:w-[var(--panel-width)] sm:shrink-0 sm:border-l sm:border-converse-border"
        :style="{ '--panel-width': settingsPanelWidth + 'px' }"
    >
        <div class="cv-settings-panel__resize-handle absolute inset-y-0 left-0 hidden w-2 cursor-col-resize sm:block" @pointerdown="startDrag" />

        <div class="cv-settings-panel__header mb-4 flex items-center justify-between">
            <h2 class="font-medium text-converse-text">Settings</h2>
            <button type="button" class="cv-settings-panel__close text-converse-textMuted hover:text-converse-text" @click="emit('close')">×</button>
        </div>

        <div class="cv-settings-panel__avatar mb-6 flex flex-col items-center gap-2">
            <Avatar :name="me?.name ?? ''" :avatar-url="me?.avatar_url" :size="88" />
            <label class="cv-settings-panel__avatar-upload cursor-pointer text-sm text-converse-accent">
                {{ uploading ? 'Uploading…' : 'Change photo' }}
                <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="onFileChange">
            </label>
            <p v-if="uploadError" class="cv-settings-panel__avatar-error text-xs text-converse-danger">{{ uploadError }}</p>
        </div>

        <div class="cv-settings-panel__theme mb-3 flex items-center justify-between rounded-cv border border-converse-border p-3">
            <span class="text-sm text-converse-text">Dark mode</span>
            <button
                type="button"
                class="cv-settings-panel__theme-switch relative h-6 w-11 rounded-full transition-colors"
                :class="theme === 'dark' ? 'bg-converse-accent' : 'bg-converse-border'"
                role="switch"
                :aria-checked="theme === 'dark'"
                @click="toggleTheme"
            >
                <span
                    class="cv-settings-panel__theme-knob absolute top-0.5 h-5 w-5 rounded-full bg-converse-surface transition-transform"
                    :class="theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'"
                />
            </button>
        </div>

        <div class="cv-settings-panel__privacy rounded-cv border border-converse-border">
            <div class="cv-settings-panel__privacy-row flex items-center justify-between border-b border-converse-border p-3">
                <span class="text-sm text-converse-text">Show my last seen &amp; online status</span>
                <button
                    type="button"
                    class="cv-settings-panel__last-seen-switch relative h-6 w-11 shrink-0 rounded-full transition-colors"
                    :class="showLastSeen ? 'bg-converse-accent' : 'bg-converse-border'"
                    role="switch"
                    :aria-checked="showLastSeen"
                    @click="onToggleLastSeen"
                >
                    <span
                        class="absolute top-0.5 h-5 w-5 rounded-full bg-converse-surface transition-transform"
                        :class="showLastSeen ? 'translate-x-5' : 'translate-x-0.5'"
                    />
                </button>
            </div>
            <div class="cv-settings-panel__privacy-row flex items-center justify-between p-3">
                <span class="text-sm text-converse-text">Show my read receipts</span>
                <button
                    type="button"
                    class="cv-settings-panel__read-receipts-switch relative h-6 w-11 shrink-0 rounded-full transition-colors"
                    :class="showReadReceipts ? 'bg-converse-accent' : 'bg-converse-border'"
                    role="switch"
                    :aria-checked="showReadReceipts"
                    @click="onToggleReadReceipts"
                >
                    <span
                        class="absolute top-0.5 h-5 w-5 rounded-full bg-converse-surface transition-transform"
                        :class="showReadReceipts ? 'translate-x-5' : 'translate-x-0.5'"
                    />
                </button>
            </div>
        </div>
    </div>
</template>
