<script setup>
defineProps({
    message: { type: Object, required: true },
});
</script>

<template>
    <div class="cv-sticker-message">
        <img
            v-for="attachment in message.attachments"
            :key="attachment.id"
            :src="attachment.url"
            :alt="attachment.original_filename"
            class="h-32 w-32 object-contain"
        >
    </div>
</template>
