<script setup>
defineProps({
    message: { type: Object, required: true },
});
</script>

<template>
    <div class="cv-gif-message">
        <div class="cv-gif-message__grid gap-1">
            <a
                v-for="attachment in message.attachments"
                :key="attachment.id"
                :href="attachment.url"
                target="_blank"
                rel="noopener noreferrer"
                class="relative"
            >
                <img
                    :src="attachment.url"
                    :alt="attachment.original_filename"
                    class="max-h-64 w-full rounded object-cover"
                />
                <span
                    class="absolute left-1 top-1 rounded bg-converse-overlay/60 px-1 text-[10px] font-medium text-white"
                    >GIF</span
                >
            </a>
        </div>
        <p
            v-if="message.body"
            class="cv-gif-message__caption mt-1 whitespace-pre-wrap break-words text-sm"
        >
            {{ message.body }}
        </p>
    </div>
</template>
