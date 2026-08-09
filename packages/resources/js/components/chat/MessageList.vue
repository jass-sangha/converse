<script setup>
import { computed, nextTick, onMounted, onUpdated, ref, watch } from 'vue';
import MessageBubble from './MessageBubble.vue';
import { useChatStore } from '../../store';
import { useMessages } from '../../composables/useMessages';
import { resolveWallpaperCss } from '../../wallpapers';

const props = defineProps({
    conversationId: { type: Number, required: true },
});

const emit = defineEmits(['reply', 'edit']);

const store = useChatStore();
const { loadOlder } = useMessages();

const conversation = computed(() => store.conversations.find((c) => c.id === props.conversationId));
const wallpaperCss = computed(() => resolveWallpaperCss(conversation.value?.me?.wallpaper));

const scrollEl = ref(null);
const sentinelEl = ref(null);
let observer = null;
let stickToBottom = true;

const messages = computed(() => store.messagesByConversation[props.conversationId] ?? []);

function dateLabel(date) {
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    const daysAgo = Math.floor((now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000);
    if (daysAgo < 7) return date.toLocaleDateString([], { weekday: 'long' });

    return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
}

const timeline = computed(() => {
    const items = [];
    let lastDateKey = null;

    for (const message of messages.value) {
        const date = new Date(message.created_at);
        const dateKey = date.toDateString();

        if (dateKey !== lastDateKey) {
            items.push({ kind: 'date', key: `date-${dateKey}`, label: dateLabel(date) });
            lastDateKey = dateKey;
        }

        items.push({ kind: 'message', key: message.id, message });
    }

    return items;
});

function isNearBottom() {
    const el = scrollEl.value;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
}

function scrollToBottom() {
    nextTick(() => {
        if (scrollEl.value) {
            scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
        }
    });
}

async function onIntersect(entries) {
    if (entries[0].isIntersecting) {
        const el = scrollEl.value;
        const prevHeight = el?.scrollHeight ?? 0;
        await loadOlder(props.conversationId);
        nextTick(() => {
            if (el) el.scrollTop = el.scrollHeight - prevHeight;
        });
    }
}

function setupObserver() {
    observer?.disconnect();
    if (sentinelEl.value) {
        observer = new IntersectionObserver(onIntersect, { root: scrollEl.value });
        observer.observe(sentinelEl.value);
    }
}

onMounted(() => {
    setupObserver();
    scrollToBottom();
});

onUpdated(() => {
    if (stickToBottom) scrollToBottom();
});

watch(() => props.conversationId, () => {
    stickToBottom = true;
    nextTick(setupObserver);
});

function onScroll() {
    stickToBottom = isNearBottom();
}
</script>

<template>
    <div
        ref="scrollEl"
        class="cv-message-list h-full overflow-y-auto px-3 pb-2 pt-10 sm:px-12"
        :class="{ 'cv-message-list--pattern bg-converse-chatBg': !wallpaperCss }"
        :style="wallpaperCss ? { backgroundColor: wallpaperCss } : {}"
        @scroll="onScroll"
    >
        <div ref="sentinelEl" class="cv-message-list__sentinel h-1" />

        <div class="cv-message-list__messages mx-auto flex max-w-5xl flex-col gap-2">
            <template v-for="item in timeline" :key="item.key">
                <div v-if="item.kind === 'date'" class="flex justify-center py-1">
                    <span class="rounded-lg bg-converse-surfaceHover px-3 py-1.5 text-xs font-medium text-converse-textMuted shadow-sm">{{ item.label }}</span>
                </div>
                <MessageBubble
                    v-else
                    :id="`cv-message-${item.message.id}`"
                    :message="item.message"
                    @reply="(m) => emit('reply', m)"
                    @edit="(m) => emit('edit', m)"
                />
            </template>
        </div>
    </div>
</template>

<style scoped>
.cv-message-list--pattern {
    background-image: radial-gradient(rgb(var(--cv-border)) 0.5px, transparent 0.5px);
    background-size: 16px 16px;
}
</style>
