<script setup>
import { ref } from "vue";
import UserPicker from "../shared/UserPicker.vue";
import Avatar from "../shared/Avatar.vue";
import SidebarScreenHeader from "../shared/SidebarScreenHeader.vue";
import GlobalMenu from "../shared/GlobalMenu.vue";
import { useConversations } from "../../composables/useConversations";
import { useSidebarUi } from "../../composables/useSidebarUi";

const { setView, setFilter } = useSidebarUi();

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
        setFilter("all");
        setView("chats");
    } finally {
        creating.value = false;
    }
}
</script>

<template>
    <div class="chat-new-group-panel flex h-full flex-col bg-riwaaq-surface">
        <SidebarScreenHeader title="New group" @back="setView('chats')">
            <GlobalMenu />
        </SidebarScreenHeader>

        <UserPicker
            v-model="selected"
            :multiple="true"
            class="min-h-0 flex-1"
        />

        <div
            class="chat-new-group-panel__details shrink-0 border-t border-riwaaq-border p-3"
        >
            <div class="mb-3 flex items-center gap-3">
                <label
                    class="group relative shrink-0 cursor-pointer rounded-full"
                >
                    <Avatar
                        :name="name || 'Group'"
                        :avatar-url="avatarPreview"
                        :size="70"
                    />
                    <span
                        class="absolute inset-0 flex items-center justify-center rounded-full bg-riwaaq-overlay/0 text-[9px] font-medium text-white opacity-0 transition group-hover:bg-riwaaq-overlay/40 group-hover:opacity-100"
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

                <div class="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                        v-model="name"
                        type="text"
                        placeholder="Group name"
                        class="chat-new-group-panel__name-input h-9 w-full rounded-full border border-riwaaq-border bg-riwaaq-surfaceHover px-4 text-[13.5px] text-riwaaq-text outline-none focus:border-riwaaq-accent"
                    />
                    <input
                        v-model="description"
                        type="text"
                        placeholder="Description (optional)"
                        class="chat-new-group-panel__description-input h-9 w-full rounded-full border border-riwaaq-border bg-riwaaq-surfaceHover px-4 text-[13.5px] text-riwaaq-text outline-none focus:border-riwaaq-accent"
                    />
                </div>
            </div>

            <button
                type="button"
                class="chat-new-group-panel__submit w-full rounded-full bg-riwaaq-accent py-2 text-sm font-semibold text-riwaaq-accentContrast disabled:opacity-50"
                :disabled="!name.trim() || !selected.length || creating"
                @click="create"
            >
                {{ creating ? "Creating…" : "Create group" }}
            </button>
        </div>
    </div>
</template>
