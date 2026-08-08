<script setup>
defineProps({
    preview: { type: Object, required: true },
});
</script>

<template>
    <a
        v-if="preview?.url"
        :href="preview.url"
        target="_blank"
        rel="noopener noreferrer"
        class="cv-link-preview-card mt-1 block overflow-hidden rounded border border-converse-border bg-converse-surface hover:bg-converse-surfaceHover"
    >
        <img v-if="preview.image" :src="preview.image" alt="" class="h-32 w-full object-cover">
        <div class="cv-link-preview-card__body p-2">
            <p v-if="preview.site_name" class="text-xs uppercase text-converse-textMuted">{{ preview.site_name }}</p>
            <p v-if="preview.title" class="text-sm font-medium text-converse-text">{{ preview.title }}</p>
            <p v-if="preview.description" class="line-clamp-2 text-xs text-converse-textMuted">{{ preview.description }}</p>
        </div>
    </a>
</template>
