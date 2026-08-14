<script setup>
import { ref } from "vue";
import UserPicker from "../shared/UserPicker.vue";
import Avatar from "../shared/Avatar.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import { useConversations } from "../../composables/useConversations";
import { useSidebarUi } from "../../composables/useSidebarUi";

const { setView } = useSidebarUi();

const name = ref("");
const description = ref("");
const selected = ref([]);
const avatarFile = ref(null);
const avatarPreview = ref(null);
const creating = ref(false);
const { createGroup, updateAvatar, setActive } = useConversations();

function onAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);
}

async function create() {
    if (!name.value.trim() || selected.value.length < 1 || creating.value)
        return;

    creating.value = true;
    try {
        const conversation = await createGroup(
            name.value.trim(),
            description.value.trim() || null,
            selected.value,
        );

        if (avatarFile.value) {
            await updateAvatar(conversation.id, avatarFile.value);
        }

        setActive(conversation.id);
        setView("chats");
    } finally {
        creating.value = false;
    }
}
</script>

<template>
    <div class="cv-new-group-panel flex h-full flex-col bg-converse-surface">
        <SidebarScreenHeader title="New group" @back="setView('chats')">
            <GlobalMenu />
        </SidebarScreenHeader>

        <div class="flex min-h-0 flex-1 flex-col p-4">
            <div class="mb-3 flex shrink-0 justify-center">
                <label class="group relative cursor-pointer rounded-full">
                    <Avatar
                        :name="name || 'Group'"
                        :avatar-url="avatarPreview"
                        :size="72"
                    />
                    <span
                        class="absolute inset-0 flex items-center justify-center rounded-full bg-converse-overlay/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-converse-overlay/40 group-hover:opacity-100"
                    >
                        Add photo
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="onAvatarChange"
                    />
                </label>
            </div>

            <input
                v-model="name"
                type="text"
                placeholder="Group name"
                class="cv-new-group-panel__name-input mb-2 h-11 w-full shrink-0 rounded-full border border-converse-border bg-converse-surfaceHover px-4 text-[13.5px] text-converse-text outline-none focus:border-converse-accent"
            />
            <input
                v-model="description"
                type="text"
                placeholder="Description (optional)"
                class="cv-new-group-panel__description-input mb-2 h-11 w-full shrink-0 rounded-full border border-converse-border bg-converse-surfaceHover px-4 text-[13.5px] text-converse-text outline-none focus:border-converse-accent"
            />
            <div class="min-h-0 flex-1">
                <UserPicker v-model="selected" :multiple="true" />
            </div>
        </div>

        <div class="border-t border-converse-border p-3">
            <button
                type="button"
                class="cv-new-group-panel__submit w-full rounded-full bg-converse-accent py-2 text-sm font-semibold text-converse-accentContrast disabled:opacity-50"
                :disabled="!name.trim() || !selected.length || creating"
                @click="create"
            >
                {{ creating ? "Creating…" : "Create group" }}
            </button>
        </div>
    </div>
</template>
