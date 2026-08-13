<script setup>
import MediaDocsLinksGrid from './MediaDocsLinksGrid.vue';
import SidebarScreenHeader from '../shared/SidebarScreenHeader.vue';
import GlobalMenu from '../shared/GlobalMenu.vue';
import { useSidebarUi } from '../../composables/useSidebarUi';

const { setView } = useSidebarUi();
</script>

<template>
    <div class="cv-media-panel flex h-full flex-col bg-converse-surface">
        <SidebarScreenHeader title="Media" @back="setView('chats')">
            <GlobalMenu />
        </SidebarScreenHeader>

        <MediaDocsLinksGrid />
    </div>
</template>
