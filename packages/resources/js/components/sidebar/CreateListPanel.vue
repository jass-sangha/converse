<script setup>
import { computed, ref } from 'vue';
import Avatar from '../shared/Avatar.vue';
import { useChatStore } from '../../store';
import { useUsers } from '../../composables/useUsers';
import { useChatLists } from '../../composables/useChatLists';
import { useSidebarUi } from '../../composables/useSidebarUi';
import { chatableKeyOf } from '../../chatable';

const store = useChatStore();
const { get } = useUsers();
const { create } = useChatLists();
const { setView } = useSidebarUi();

const name = ref('');
const showPicker = ref(false);
const pickerQuery = ref('');
const selectedIds = ref([]);
const creating = ref(false);
const error = ref('');

function conversationLabel(conversation) {
    if (conversation.type === 'group') return conversation.name || 'Group';
    const other = (conversation.participants ?? []).find((p) => chatableKeyOf(p) !== store.currentKey);
    return other ? get({ type: other.chatable_type, id: other.chatable_id }).name : 'Unknown';
}

function conversationAvatar(conversation) {
    if (conversation.avatar_url) return conversation.avatar_url;
    if (conversation.type === 'group') return null;
    const other = (conversation.participants ?? []).find((p) => chatableKeyOf(p) !== store.currentKey);
    return other ? get({ type: other.chatable_type, id: other.chatable_id }).avatar_url : null;
}

const filteredConversations = computed(() => {
    const q = pickerQuery.value.trim().toLowerCase();
    return store.conversations.filter((c) => !q || conversationLabel(c).toLowerCase().includes(q));
});

const selectedConversations = computed(() => store.conversations.filter((c) => selectedIds.value.includes(c.id)));

function toggle(conversationId) {
    if (selectedIds.value.includes(conversationId)) {
        selectedIds.value = selectedIds.value.filter((id) => id !== conversationId);
    } else {
        selectedIds.value = [...selectedIds.value, conversationId];
    }
}

async function submit() {
    if (!name.value.trim()) return;

    error.value = '';
    creating.value = true;
    try {
        await create(name.value.trim(), selectedIds.value);
        setView('chats');
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Could not create the list.';
    } finally {
        creating.value = false;
    }
}
</script>

<template>
    <div class="cv-create-list-panel flex h-full flex-col bg-converse-surface">
        <div class="cv-create-list-panel__header flex items-center gap-3 border-b border-converse-border px-3 py-3">
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover" @click="setView('chats')">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20Z"/></svg>
            </button>
            <h1 class="text-lg font-semibold text-converse-text">Create new list</h1>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
            <label class="mb-1 block text-xs font-medium uppercase text-converse-textMuted">List name</label>
            <input
                v-model="name"
                type="text"
                placeholder="List name"
                maxlength="60"
                class="w-full border-b border-converse-border bg-transparent pb-2 text-[15px] text-converse-text focus:border-converse-accent focus:outline-none"
            >

            <p v-if="error" class="mt-2 text-xs text-converse-danger">{{ error }}</p>

            <h2 class="mb-2 mt-6 text-xs font-medium uppercase text-converse-textMuted">Included</h2>

            <div class="flex flex-col gap-1">
                <div
                    v-for="conversation in selectedConversations"
                    :key="conversation.id"
                    class="flex items-center gap-3 rounded px-1 py-1.5"
                >
                    <Avatar :name="conversationLabel(conversation)" :avatar-url="conversationAvatar(conversation)" :size="36" />
                    <span class="flex-1 truncate text-sm text-converse-text">{{ conversationLabel(conversation) }}</span>
                    <button type="button" class="text-xs text-converse-textMuted hover:text-converse-danger" @click="toggle(conversation.id)">Remove</button>
                </div>

                <button
                    type="button"
                    class="flex items-center gap-3 rounded px-1 py-1.5 text-left hover:bg-converse-surfaceHover"
                    @click="showPicker = !showPicker"
                >
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-converse-accent text-white">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z"/></svg>
                    </span>
                    <span class="text-sm text-converse-accent">Add people or groups</span>
                </button>
            </div>

            <div v-if="showPicker" class="mt-3 rounded-cv border border-converse-border">
                <input
                    v-model="pickerQuery"
                    type="text"
                    placeholder="Search chats"
                    class="w-full border-b border-converse-border px-3 py-2 text-sm focus:outline-none"
                >
                <ul class="max-h-64 overflow-y-auto">
                    <li
                        v-for="conversation in filteredConversations"
                        :key="conversation.id"
                        class="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-converse-surfaceHover"
                        @click="toggle(conversation.id)"
                    >
                        <input type="checkbox" class="pointer-events-none" :checked="selectedIds.includes(conversation.id)">
                        <Avatar :name="conversationLabel(conversation)" :avatar-url="conversationAvatar(conversation)" :size="32" />
                        <span class="truncate text-sm text-converse-text">{{ conversationLabel(conversation) }}</span>
                    </li>
                    <li v-if="!filteredConversations.length" class="px-3 py-3 text-center text-sm text-converse-textMuted">No chats found.</li>
                </ul>
            </div>
        </div>

        <div class="border-t border-converse-border p-3">
            <button
                type="button"
                class="w-full rounded bg-converse-accent py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="!name.trim() || creating"
                @click="submit"
            >
                {{ creating ? 'Creating…' : 'Create list' }}
            </button>
        </div>
    </div>
</template>
