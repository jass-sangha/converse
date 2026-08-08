<script setup>
import { computed } from 'vue';
import { useUsers } from '../../../composables/useUsers';

const props = defineProps({
    message: { type: Object, required: true },
});

const { get } = useUsers();

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
        default:
            return 'Group updated';
    }
});
</script>

<template>
    <p class="cv-system-message text-center text-xs text-converse-textMuted">{{ text }}</p>
</template>
