<script setup>
import MediaDocsLinksGrid from './MediaDocsLinksGrid.vue';
</script>

<template>
    <div class="cv-media-panel flex h-full flex-col bg-converse-surface">
        <div class="cv-media-panel__header flex items-center gap-3 border-b border-converse-border px-4 py-3">
            <h1 class="text-lg font-semibold text-converse-text">Media</h1>
        </div>

        <MediaDocsLinksGrid />
    </div>
</template>
