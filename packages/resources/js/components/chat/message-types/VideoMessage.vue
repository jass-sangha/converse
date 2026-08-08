<script setup>
defineProps({
    message: { type: Object, required: true },
});
</script>

<template>
    <div class="cv-video-message">
        <video
            v-for="attachment in message.attachments"
            :key="attachment.id"
            :src="attachment.url"
            controls
            class="max-h-64 max-w-full rounded"
        />
        <p v-if="message.body" class="cv-video-message__caption mt-1 whitespace-pre-wrap break-words text-sm">{{ message.body }}</p>
    </div>
</template>
