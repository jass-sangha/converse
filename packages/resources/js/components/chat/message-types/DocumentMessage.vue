<script setup>
defineProps({
    message: { type: Object, required: true },
});

function formatSize(bytes) {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}
</script>

<template>
    <a
        v-for="attachment in message.attachments"
        :key="attachment.id"
        :href="attachment.url"
        target="_blank"
        rel="noopener noreferrer"
        class="cv-document-message flex items-center gap-2 rounded border border-converse-border bg-converse-surface p-2 hover:bg-converse-surfaceHover"
    >
        <span class="text-2xl">📄</span>
        <span class="cv-document-message__meta min-w-0">
            <span class="block truncate text-sm font-medium">{{ attachment.original_filename }}</span>
            <span class="block text-xs text-converse-textMuted">{{ formatSize(attachment.size_bytes) }}</span>
        </span>
    </a>
</template>
