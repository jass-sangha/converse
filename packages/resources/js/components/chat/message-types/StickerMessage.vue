<script setup>
import { ref } from "vue";
import MediaViewerModal from "../../shared/MediaViewerModal.vue";

const props = defineProps({
    message: { type: Object, required: true },
});

const viewerIndex = ref(null);

const viewerItems = props.message.attachments.map((attachment) => ({
    url: attachment.url,
    kind: "image",
    original_filename: attachment.original_filename,
}));
</script>

<template>
    <div class="cv-sticker-message flex flex-wrap gap-1">
        <button
            v-for="(attachment, index) in message.attachments"
            :key="attachment.id"
            type="button"
            title="View"
            @click="viewerIndex = index"
        >
            <img
                :src="attachment.url"
                :alt="attachment.original_filename"
                class="h-32 w-32 object-contain"
            >
        </button>
    </div>

    <MediaViewerModal
        v-if="viewerIndex !== null"
        :items="viewerItems"
        :index="viewerIndex"
        @close="viewerIndex = null"
    />
</template>
