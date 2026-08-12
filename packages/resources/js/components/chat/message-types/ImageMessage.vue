<script setup>
defineProps({
    message: { type: Object, required: true },
});
</script>

<template>
    <div class="cv-image-message">
        <div class="cv-image-message__grid gap-1">
            <a
                v-for="attachment in message.attachments"
                :key="attachment.id"
                :href="attachment.url"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    :src="attachment.thumbnail_url || attachment.url"
                    :alt="attachment.original_filename"
                    class="max-h-64 w-full rounded object-cover"
                />
            </a>
        </div>
        <p
            v-if="message.body"
            class="cv-image-message__caption mt-1 whitespace-pre-wrap break-words text-sm"
        >
            {{ message.body }}
        </p>
    </div>
</template>
