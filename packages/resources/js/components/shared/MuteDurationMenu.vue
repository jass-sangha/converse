<script setup>
import { MUTE_DURATIONS } from '../../muteDurations';

defineProps({
    showUnmute: { type: Boolean, default: false },
});

const emit = defineEmits(['pick', 'unmute']);
</script>

<template>
    <div class="cv-mute-duration-menu w-48 rounded-[22px] border border-converse-border bg-converse-surface p-2 shadow-lg">
        <p class="px-3.5 pb-1 pt-2 text-xs font-medium uppercase text-converse-textMuted">Mute for</p>
        <button
            v-for="duration in MUTE_DURATIONS"
            :key="duration.key"
            type="button"
            class="block w-full rounded-full px-3.5 py-2.5 text-left text-sm text-converse-text hover:bg-converse-surfaceHover"
            @click="emit('pick', duration.key)"
        >
            {{ duration.label }}
        </button>
        <template v-if="showUnmute">
            <div class="my-1 border-t border-converse-border" />
            <button type="button" class="block w-full rounded-full px-3.5 py-2.5 text-left text-sm text-converse-accent hover:bg-converse-surfaceHover" @click="emit('unmute')">
                Unmute
            </button>
        </template>
    </div>
</template>
