<script setup>
import MediaDocsLinksGrid from './MediaDocsLinksGrid.vue';
import { useSidebarUi } from '../../composables/useSidebarUi';

const { setView } = useSidebarUi();
</script>

<template>
    <div class="cv-media-panel flex h-full flex-col bg-converse-surface">
        <div class="cv-media-panel__header flex items-center gap-3 border-b border-converse-border px-4 py-3">
            <button type="button" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover sm:hidden" @click="setView('chats')">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20Z"/></svg>
            </button>
            <h1 class="text-lg font-semibold text-converse-text">Media</h1>
        </div>

        <MediaDocsLinksGrid />
    </div>
</template>
