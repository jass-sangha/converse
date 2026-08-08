<script setup>
import { computed } from 'vue';

const props = defineProps({
    name: { type: String, default: '' },
    avatarUrl: { type: String, default: null },
    size: { type: Number, default: 40 },
});

const initials = computed(() => {
    const parts = (props.name || '?').trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
});
</script>

<template>
    <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="name"
        class="cv-avatar rounded-full object-cover"
        :style="{ width: size + 'px', height: size + 'px' }"
    >
    <div
        v-else
        class="cv-avatar flex items-center justify-center rounded-full bg-converse-accent font-medium text-white"
        :style="{ width: size + 'px', height: size + 'px', fontSize: Math.round(size / 2.5) + 'px' }"
    >
        {{ initials }}
    </div>
</template>
