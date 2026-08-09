<script setup>
import { MUTE_DURATIONS } from '../../muteDurations';

defineProps({
    showUnmute: { type: Boolean, default: false },
});

const emit = defineEmits(['pick', 'unmute']);
</script>

<template>
    <div class="cv-mute-duration-menu w-44 rounded-cv border border-converse-border bg-converse-surface py-1 shadow-lg">
        <p class="px-3 pb-1 pt-2 text-xs font-medium uppercase text-converse-textMuted">Mute for</p>
        <button
            v-for="duration in MUTE_DURATIONS"
            :key="duration.key"
            type="button"
            class="block w-full px-3 py-2 text-left text-sm text-converse-text hover:bg-converse-surfaceHover"
            @click="emit('pick', duration.key)"
        >
            {{ duration.label }}
        </button>
        <template v-if="showUnmute">
            <div class="my-1 border-t border-converse-border" />
            <button type="button" class="block w-full px-3 py-2 text-left text-sm text-converse-accent hover:bg-converse-surfaceHover" @click="emit('unmute')">
                Unmute
            </button>
        </template>
    </div>
</template>
