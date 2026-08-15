<script setup>
import AlbumGrid from "./AlbumGrid.vue";

defineProps({
    message: { type: Object, required: true },
});
</script>

<template>
    <div class="cv-gif-message">
        <AlbumGrid :attachments="message.attachments" kind="image" badge="GIF" />
        <p
            v-if="message.body"
            class="cv-gif-message__caption mt-1 whitespace-pre-wrap break-words text-sm"
        >
            {{ message.body }}
        </p>
    </div>
</template>
