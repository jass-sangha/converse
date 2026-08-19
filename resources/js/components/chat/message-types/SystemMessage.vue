<script setup>
import { computed, watch } from 'vue';
import { useUsers } from '../../../composables/useUsers';

const props = defineProps({
    message: { type: Object, required: true },
});

const { get, resolve } = useUsers();

// Unlike a regular message, a system event's actor/target(s) may never have appeared
// anywhere else in this conversation before (e.g. someone just added for the first time) —
// so they aren't guaranteed to already be in the users cache the way a message sender is.
const refsToResolve = computed(() => {
    const meta = props.message.metadata ?? {};
    const refs = [];
    if (meta.actor_type) refs.push({ type: meta.actor_type, id: meta.actor_id });
    if (meta.target_type) refs.push({ type: meta.target_type, id: meta.target_id });
    if (Array.isArray(meta.targets)) refs.push(...meta.targets);
    return refs;
});

watch(refsToResolve, (refs) => { if (refs.length) resolve(refs); }, { immediate: true });

const text = computed(() => {
    const meta = props.message.metadata ?? {};
    const actor = meta.actor_type ? get({ type: meta.actor_type, id: meta.actor_id }).name : 'Someone';
    const target = meta.target_type ? get({ type: meta.target_type, id: meta.target_id }) : null;

    switch (meta.event) {
        case 'participant_added': {
            const names = (meta.targets ?? []).map((t) => get(t).name).join(', ');
            return `${actor} added ${names}`;
        }
        case 'participant_removed':
            return `${actor} removed ${target?.name ?? 'someone'}`;
        case 'participant_left':
            return `${target?.name ?? 'Someone'} left`;
        case 'participant_role_changed':
            return `${target?.name ?? 'Someone'} is now ${meta.role === 'admin' ? 'an admin' : 'a member'}`;
        case 'group_created':
            return `${actor} created this group`;
        default:
            return 'Group updated';
    }
});
</script>

<template>
    <div class="chat-system-message flex justify-center py-1">
        <p class="max-w-[85%] rounded-lg bg-riwaaq-surfaceHover px-3 py-1.5 text-center text-xs text-riwaaq-textMuted shadow-sm">{{ text }}</p>
    </div>
</template>
