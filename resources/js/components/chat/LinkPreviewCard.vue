<script setup>
defineProps({
    preview: { type: Object, required: true },
    isOwn: { type: Boolean, default: false },
});
</script>

<template>
    <a
        v-if="preview?.url"
        :href="preview.url"
        target="_blank"
        rel="noopener noreferrer"
        class="chat-link-preview-card mt-1 block overflow-hidden rounded-2xl"
        :class="isOwn ? 'bg-[rgba(140,73,26,.09)]' : 'bg-riwaaq-surfaceHover'"
    >
        <img v-if="preview.image" :src="preview.image" alt="" class="aspect-[16/8] w-full object-cover">
        <div class="chat-link-preview-card__body pt-[9px] px-3 pb-[11px]">
            <p v-if="preview.site_name" class="text-[11px] font-bold uppercase tracking-wide text-riwaaq-textDim">{{ preview.site_name }}</p>
            <p v-if="preview.title" class="mt-[3px] text-[13.5px] font-semibold leading-tight text-riwaaq-text">{{ preview.title }}</p>
            <p v-if="preview.description" class="mt-[3px] line-clamp-2 text-xs leading-snug text-riwaaq-textMuted">{{ preview.description }}</p>
            <p class="mt-[3px] truncate text-[11px] text-riwaaq-textDim">{{ preview.url }}</p>
        </div>
    </a>
</template>
