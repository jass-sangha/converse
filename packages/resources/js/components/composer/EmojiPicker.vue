<script setup>
const EMOJIS = [
    '😀', '😂', '😍', '😊', '😉', '😢', '😮', '😡',
    '👍', '👎', '🙏', '👏', '🎉', '❤️', '🔥', '💯',
];

const emit = defineEmits(['pick']);
</script>

<template>
    <div class="cv-emoji-picker grid grid-cols-8 gap-1 rounded border border-converse-border bg-converse-surface p-2 shadow-lg">
        <button
            v-for="emoji in EMOJIS"
            :key="emoji"
            type="button"
            class="cv-emoji-picker__item text-lg hover:scale-125"
            @click="emit('pick', emoji)"
        >
            {{ emoji }}
        </button>
    </div>
</template>
