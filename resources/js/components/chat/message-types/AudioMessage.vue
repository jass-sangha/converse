<script setup>
defineProps({
    message: { type: Object, required: true },
});
</script>

<template>
    <div class="chat-audio-message">
        <audio
            v-for="attachment in message.attachments"
            :key="attachment.id"
            :src="attachment.url"
            controls
            class="max-w-full"
        />
    </div>
</template>
