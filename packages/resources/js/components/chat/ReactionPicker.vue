<script setup>
const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const emit = defineEmits(['pick']);
</script>

<template>
    <div class="cv-reaction-picker flex gap-1 rounded-full border border-converse-border bg-converse-surface px-2 py-1 shadow">
        <button
            v-for="emoji in EMOJIS"
            :key="emoji"
            type="button"
            class="text-lg hover:scale-125"
            @click="emit('pick', emoji)"
        >
            {{ emoji }}
        </button>
    </div>
</template>
