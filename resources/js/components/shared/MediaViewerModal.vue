<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Icon from './Icon.vue';

const props = defineProps({
    items: { type: Array, required: true },
    index: { type: Number, default: 0 },
});

const emit = defineEmits(['close']);

// Everything else browsers happily render inline via <iframe> — for anything not in this list
// (docx, xlsx, zip, ...) there's nothing useful to embed, so the modal falls back to a plain
// "open it yourself" state instead of a blank or broken frame.
const IFRAME_RENDERABLE_MIME_TYPES = new Set(['application/pdf', 'text/plain', 'text/html']);

const current = ref(props.index);
const item = computed(() => props.items[current.value]);
const isDocument = computed(() => item.value?.kind === 'document');
const isIframeRenderable = computed(
    () => isDocument.value && IFRAME_RENDERABLE_MIME_TYPES.has(item.value?.mime_type),
);

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
    <div class="chat-media-viewer chat-animate-fade-in fixed inset-0 z-[60] flex flex-col bg-black/90" @click.self="close">
        <div class="flex items-center justify-between px-4 py-3 text-white/90" @click.self="close">
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
                    <Icon name="download" :size="18" />
                </a>
                <button type="button" title="Close" class="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10" @click="close">
                    <Icon name="close" :size="18" />
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
                <Icon name="chevron-left" :size="20" />
            </button>

            <video v-if="item?.kind === 'video'" :src="item.url" controls autoplay class="max-h-full max-w-full rounded" />
            <iframe
                v-else-if="isIframeRenderable"
                :src="item.url"
                :title="item.original_filename"
                class="h-full max-h-full w-full max-w-3xl rounded bg-white"
            />
            <div
                v-else-if="isDocument"
                class="flex flex-col items-center gap-4 rounded-2xl bg-white/5 px-10 py-14 text-center text-white/80"
            >
                <Icon name="document" :size="40" class="text-white/50" />
                <p class="text-sm">No preview available for this file type.</p>
                <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="rounded-full bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/20"
                >
                    Download {{ item.original_filename }}
                </a>
            </div>
            <img v-else :src="item?.url" :alt="item?.original_filename" class="max-h-full max-w-full rounded object-contain">

            <button
                v-if="current < items.length - 1"
                type="button"
                title="Next"
                class="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                @click.stop="next"
            >
                <Icon name="chevron-right" :size="20" />
            </button>
        </div>
    </div>
</template>
