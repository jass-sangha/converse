<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import Avatar from '../shared/Avatar.vue';
import UserPicker from '../shared/UserPicker.vue';
import DisappearingToggle from './DisappearingToggle.vue';
import { useChatStore } from '../../store';
import { useUsers } from '../../composables/useUsers';
import { useParticipants } from '../../composables/useParticipants';
import { useBlockedUsers } from '../../composables/useBlockedUsers';
import { useConversations } from '../../composables/useConversations';
import { WALLPAPER_PRESETS } from '../../wallpapers';

const props = defineProps({
    conversation: { type: Object, required: true },
});

const emit = defineEmits(['close']);

const store = useChatStore();
const { resolve, get } = useUsers();
const { add, remove, changeRole } = useParticipants();
const { block, unblock, list: listBlocked } = useBlockedUsers();
const { refreshOne, leave, setWallpaper } = useConversations();

const showAddMember = ref(false);
const picked = ref([]);
const error = ref('');
const blockedIds = ref([]);

const isGroup = computed(() => props.conversation.type === 'group');
const myRole = computed(() => props.conversation.me?.role);
const isAdmin = computed(() => myRole.value === 'admin');

const otherParticipant = computed(() => {
    if (isGroup.value) return null;
    const other = (props.conversation.participants ?? []).find((p) => p.user_id !== store.currentUserId);
    return other ? get(other.user_id) : null;
});

const isOtherBlocked = computed(() => {
    const otherId = (props.conversation.participants ?? []).find((p) => p.user_id !== store.currentUserId)?.user_id;
    return otherId ? blockedIds.value.includes(otherId) : false;
});

async function loadAll() {
    const ids = (props.conversation.participants ?? []).map((p) => p.user_id);
    if (ids.length) await resolve(ids);

    if (!isGroup.value) {
        const blocked = await listBlocked();
        blockedIds.value = blocked.map((b) => b.blocked_id);
    }
}

onMounted(loadAll);
watch(() => props.conversation.id, loadAll);

async function addMembers() {
    error.value = '';
    try {
        await add(props.conversation.id, picked.value.map((u) => u.id));
        await refreshOne(props.conversation.id);
        showAddMember.value = false;
        picked.value = [];
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Could not add members.';
    }
}

async function removeMember(userId) {
    error.value = '';
    try {
        await remove(props.conversation.id, userId);
        await refreshOne(props.conversation.id);
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Could not remove member.';
    }
}

async function toggleAdmin(participant) {
    error.value = '';
    try {
        await changeRole(props.conversation.id, participant.user_id, participant.role === 'admin' ? 'member' : 'admin');
        await refreshOne(props.conversation.id);
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Could not change role.';
    }
}

async function leaveGroup() {
    error.value = '';
    try {
        await leave(props.conversation.id);
        emit('close');
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Could not leave the group.';
    }
}

async function onPickWallpaper(key) {
    await setWallpaper(props.conversation.id, key === 'default' ? null : key);
}

async function onPickCustomColor(event) {
    await setWallpaper(props.conversation.id, event.target.value);
}

async function toggleBlockOther() {
    const otherId = (props.conversation.participants ?? []).find((p) => p.user_id !== store.currentUserId)?.user_id;
    if (!otherId) return;

    if (isOtherBlocked.value) {
        await unblock(otherId);
        blockedIds.value = blockedIds.value.filter((id) => id !== otherId);
    } else {
        await block(otherId);
        blockedIds.value.push(otherId);
    }
}
</script>

<template>
    <div class="cv-group-info-panel fixed inset-0 z-40 overflow-y-auto bg-converse-surface p-3 sm:static sm:z-auto sm:w-72 sm:shrink-0 sm:border-l sm:border-converse-border">
        <div class="cv-group-info-panel__header mb-3 flex items-center justify-between">
            <h2 class="font-medium">Info</h2>
            <button type="button" class="text-converse-textMuted hover:text-converse-textMuted" @click="emit('close')">×</button>
        </div>

        <div class="cv-group-info-panel__avatar mb-4 flex flex-col items-center">
            <Avatar
                :name="isGroup ? (conversation.name || 'Group') : (otherParticipant?.name ?? '')"
                :avatar-url="isGroup ? conversation.avatar_url : otherParticipant?.avatar_url"
                :size="72"
            />
            <p class="mt-2 font-medium">{{ isGroup ? (conversation.name || 'Group') : otherParticipant?.name }}</p>
            <p v-if="conversation.description" class="text-center text-xs text-converse-textMuted">{{ conversation.description }}</p>
        </div>

        <p v-if="error" class="cv-group-info-panel__error mb-2 rounded bg-converse-danger/10 p-2 text-xs text-converse-danger">{{ error }}</p>

        <div class="cv-group-info-panel__disappearing mb-4">
            <DisappearingToggle :conversation="conversation" />
        </div>

        <div class="cv-group-info-panel__wallpaper mb-4">
            <h3 class="mb-2 text-xs font-medium uppercase text-converse-textMuted">Chat wallpaper</h3>
            <div class="cv-group-info-panel__wallpaper-swatches flex flex-wrap gap-2">
                <button
                    v-for="preset in WALLPAPER_PRESETS"
                    :key="preset.key"
                    type="button"
                    :title="preset.label"
                    class="h-7 w-7 rounded-full border-2"
                    :class="(conversation.me?.wallpaper ?? 'default') === preset.key ? 'border-converse-accent' : 'border-converse-border'"
                    :style="{ backgroundColor: preset.css ?? 'transparent' }"
                    @click="onPickWallpaper(preset.key)"
                />
                <label class="cv-group-info-panel__wallpaper-custom relative h-7 w-7 cursor-pointer rounded-full border-2 border-converse-border" title="Custom color">
                    <input type="color" class="absolute inset-0 h-full w-full cursor-pointer opacity-0" @input="onPickCustomColor">
                    <span class="pointer-events-none absolute inset-0 flex items-center justify-center text-xs">🎨</span>
                </label>
            </div>
        </div>

        <template v-if="isGroup">
            <div class="cv-group-info-panel__participants-header mb-2 flex items-center justify-between">
                <h3 class="text-xs font-medium uppercase text-converse-textMuted">Participants</h3>
                <button v-if="isAdmin" type="button" class="text-xs text-converse-accent" @click="showAddMember = !showAddMember">
                    Add
                </button>
            </div>

            <div v-if="showAddMember" class="cv-group-info-panel__add-member-form mb-3">
                <UserPicker v-model="picked" :multiple="true" />
                <button
                    type="button"
                    class="mt-2 w-full rounded bg-converse-accent py-1.5 text-sm text-white disabled:opacity-50"
                    :disabled="!picked.length"
                    @click="addMembers"
                >
                    Add selected
                </button>
            </div>

            <ul class="cv-group-info-panel__participants-list">
                <li
                    v-for="participant in conversation.participants"
                    :key="participant.user_id"
                    class="cv-group-info-panel__participant-row flex items-center gap-2 py-1.5"
                >
                    <Avatar :name="get(participant.user_id).name" :avatar-url="get(participant.user_id).avatar_url" :size="32" />
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm">{{ get(participant.user_id).name }}</p>
                        <p v-if="participant.role === 'admin'" class="text-xs text-converse-textMuted">Admin</p>
                    </div>
                    <div v-if="isAdmin && participant.user_id !== store.currentUserId" class="flex gap-1">
                        <button type="button" class="text-xs text-converse-accent" @click="toggleAdmin(participant)">
                            {{ participant.role === 'admin' ? 'Demote' : 'Promote' }}
                        </button>
                        <button type="button" class="text-xs text-converse-danger" @click="removeMember(participant.user_id)">Remove</button>
                    </div>
                </li>
            </ul>

            <button type="button" class="cv-group-info-panel__leave-button mt-4 w-full rounded border border-converse-danger/30 py-1.5 text-sm text-converse-danger" @click="leaveGroup">
                Leave group
            </button>
        </template>

        <template v-else>
            <button
                type="button"
                class="cv-group-info-panel__block-button w-full rounded border py-1.5 text-sm"
                :class="isOtherBlocked ? 'border-converse-border text-converse-textMuted' : 'border-converse-danger/30 text-converse-danger'"
                @click="toggleBlockOther"
            >
                {{ isOtherBlocked ? 'Unblock' : 'Block' }} {{ otherParticipant?.name }}
            </button>
        </template>
    </div>
</template>
