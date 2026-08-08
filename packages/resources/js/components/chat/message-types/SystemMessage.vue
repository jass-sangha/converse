<script setup>
import { computed } from 'vue';
import { useUsers } from '../../../composables/useUsers';

const props = defineProps({
    message: { type: Object, required: true },
});

const { get } = useUsers();

const text = computed(() => {
    const meta = props.message.metadata ?? {};
    const actor = meta.actor_id ? get(meta.actor_id).name : 'Someone';

    switch (meta.event) {
        case 'participant_added': {
            const names = (meta.target_ids ?? []).map((id) => get(id).name).join(', ');
            return `${actor} added ${names}`;
        }
        case 'participant_removed':
            return `${actor} removed ${get(meta.target_id).name}`;
        case 'participant_left':
            return `${get(meta.target_id).name} left`;
        case 'participant_role_changed':
            return `${get(meta.target_id).name} is now ${meta.role === 'admin' ? 'an admin' : 'a member'}`;
        default:
            return 'Group updated';
    }
});
</script>

<template>
    <p class="cv-system-message text-center text-xs text-converse-textMuted">{{ text }}</p>
</template>
