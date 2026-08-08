<script setup>
import LinkPreviewCard from '../LinkPreviewCard.vue';

defineProps({
    message: { type: Object, required: true },
});
</script>

<template>
    <div class="cv-text-message">
        <p class="cv-text-message__body whitespace-pre-wrap break-words text-sm">{{ message.body }}</p>
        <LinkPreviewCard v-if="message.metadata?.link_preview" :preview="message.metadata.link_preview" />
    </div>
</template>
