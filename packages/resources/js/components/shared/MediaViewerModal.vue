<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
    items: { type: Array, required: true },
    index: { type: Number, default: 0 },
});

const emit = defineEmits(['close']);

const current = ref(props.index);
const item = computed(() => props.items[current.value]);

function close() {
    emit('close');
}

function prev() {
    if (current.value > 0) current.value -= 1;
}

function next() {
    if (current.value < props.items.length - 1) current.value += 1;
}

function onKeydown(event) {
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') prev();
    if (event.key === 'ArrowRight') next();
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
    <div class="cv-media-viewer cv-animate-fade-in fixed inset-0 z-[60] flex flex-col bg-black/90" @click.self="close">
        <div class="flex items-center justify-between px-4 py-3 text-white/90">
            <span class="truncate text-sm">{{ item?.original_filename }}</span>
            <div class="flex shrink-0 items-center gap-3">
                <span v-if="items.length > 1" class="text-xs text-white/60">{{ current + 1 }} / {{ items.length }}</span>
                <a
                    v-if="item?.url"
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open original"
                    class="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M5 20h14v-2H5v2ZM19 9h-4V3H9v6H5l7 7 7-7Z"/></svg>
                </a>
                <button type="button" title="Close" class="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10" @click="close">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.7 2.9 18.3 9.19 12 2.9 5.71 4.3 4.29l6.3 6.3 6.29-6.3Z"/></svg>
                </button>
            </div>
        </div>

        <div class="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4" @click.self="close">
            <button
                v-if="current > 0"
                type="button"
                title="Previous"
                class="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                @click.stop="prev"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12Z"/></svg>
            </button>

            <video v-if="item?.kind === 'video'" :src="item.url" controls autoplay class="max-h-full max-w-full rounded" />
            <img v-else :src="item?.url" :alt="item?.original_filename" class="max-h-full max-w-full rounded object-contain">

            <button
                v-if="current < items.length - 1"
                type="button"
                title="Next"
                class="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                @click.stop="next"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8.6 7.4 10 6l6 6-6 6-1.4-1.4L14.2 12Z"/></svg>
            </button>
        </div>
    </div>
</template>
