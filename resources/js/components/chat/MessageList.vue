<script setup>
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    onUpdated,
    ref,
    watch,
} from "vue";
import MessageBubble from "./MessageBubble.vue";
import { useChatStore } from "../../store";
import { useMessages } from "../../composables/useMessages";
import { chatableKeyOf } from "../../chatable";

const props = defineProps({
    conversationId: { type: Number, required: true },
});

const emit = defineEmits(["reply", "edit"]);

const store = useChatStore();
const { loadOlder } = useMessages();

const scrollEl = ref(null);
const sentinelEl = ref(null);
const contentEl = ref(null);
const showScrollToBottom = ref(false);
let observer = null;
let resizeObserver = null;
let stickToBottom = true;

const messages = computed(
    () => store.messagesByConversation[props.conversationId] ?? [],
);

function dateLabel(date) {
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return "Today";

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    const daysAgo = Math.floor(
        (now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
            86400000,
    );
    if (daysAgo < 7) return date.toLocaleDateString([], { weekday: "long" });

    return date.toLocaleDateString([], {
        day: "numeric",
        month: "long",
        year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    });
}

const timeline = computed(() => {
    const items = [];
    let lastDateKey = null;

    for (const message of messages.value) {
        const date = new Date(message.created_at);
        const dateKey = date.toDateString();

        if (dateKey !== lastDateKey) {
            items.push({
                kind: "date",
                key: `date-${dateKey}`,
                label: dateLabel(date),
            });
            lastDateKey = dateKey;
        }

        items.push({ kind: "message", key: message.id, message });
    }

    return items;
});

function isNearBottom() {
    const el = scrollEl.value;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
}

function scrollToBottom({ smooth = false } = {}) {
    nextTick(() => {
        if (!scrollEl.value) return;
        scrollEl.value.scrollTo({
            top: scrollEl.value.scrollHeight,
            behavior: smooth ? "smooth" : "auto",
        });
    });
}

async function onIntersect(entries) {
    if (entries[0].isIntersecting) {
        const conversationId = props.conversationId;
        const el = scrollEl.value;
        const prevHeight = el?.scrollHeight ?? 0;
        await loadOlder(conversationId);
        // The scroll container is reused across conversations (not remounted per chat), so if the
        // user switched chats while this "load older" request was in flight, applying its
        // now-stale height adjustment here would misposition the *new* conversation's scroll —
        // and the resulting scroll event would clear stickToBottom, leaving it stuck.
        if (conversationId !== props.conversationId) return;
        // On a short conversation the top sentinel can already be intersecting on first open
        // (the whole list fits within the viewport, nothing to scroll), auto-triggering this
        // older-messages load before the user has scrolled up at all. In that case the goal is
        // still "stay at the bottom", not "preserve position while loading older content above".
        if (stickToBottom) {
            scrollToBottom();
            return;
        }
        nextTick(() => {
            if (el) el.scrollTop = el.scrollHeight - prevHeight;
        });
    }
}

function setupObserver() {
    observer?.disconnect();
    if (sentinelEl.value) {
        observer = new IntersectionObserver(onIntersect, {
            root: scrollEl.value,
        });
        observer.observe(sentinelEl.value);
    }
}

onMounted(() => {
    setupObserver();
    scrollToBottom();

    // Message content (avatars, attachment images/videos) can finish loading and change height
    // *after* Vue's own re-render has already settled, so onUpdated's stickToBottom check alone
    // can miss it — an image popping in after scrollToBottom already ran would silently leave the
    // view short of the real bottom. A ResizeObserver on the message list catches that too.
    if (contentEl.value && window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
            if (stickToBottom) scrollToBottom();
        });
        resizeObserver.observe(contentEl.value);
    }
});

onBeforeUnmount(() => resizeObserver?.disconnect());

onUpdated(() => {
    if (stickToBottom) scrollToBottom();
});

watch(
    () => props.conversationId,
    () => {
        // MessageList isn't keyed by conversationId in ChatWindow, so switching chats reuses this
        // same instance — onMounted's initial scrollToBottom() only ever fires once. Scroll here
        // explicitly rather than relying solely on onUpdated picking it up, since if the new
        // conversation's messages are already cached (no re-render triggered by a fetch), onUpdated
        // may never fire and the view would stay wherever the previous conversation left it.
        stickToBottom = true;
        showScrollToBottom.value = false;
        scrollToBottom();
        nextTick(setupObserver);
    },
);

function onScroll() {
    stickToBottom = isNearBottom();
    // A separate, larger threshold than stickToBottom's — that one governs "should a new message
    // auto-scroll me" (only when already essentially at the bottom), this one governs "have I
    // scrolled far enough away that jumping back down needs its own button".
    const el = scrollEl.value;
    showScrollToBottom.value =
        !!el && el.scrollHeight - el.scrollTop - el.clientHeight > 400;
}

function onScrollToBottomClick() {
    stickToBottom = true;
    scrollToBottom({ smooth: true });
}

// Sending your own message should always land you at the bottom to see it, even if you'd
// scrolled up to read older history first — `stickToBottom` alone won't cover that since it only
// tracks whether the user was already near the bottom before this message arrived.
watch(
    () => messages.value[messages.value.length - 1],
    (last) => {
        if (last && chatableKeyOf(last) === store.currentKey) {
            stickToBottom = true;
            scrollToBottom();
        }
    },
);
</script>

<template>
    <div class="chat-message-list-wrap relative min-h-0 flex-1 overflow-hidden">
        <div
            ref="scrollEl"
            class="chat-message-list relative h-full overflow-y-auto px-3 pb-3 pt-10 sm:px-12"
            @scroll="onScroll"
        >
            <div ref="sentinelEl" class="chat-message-list__sentinel h-1" />

            <div
                ref="contentEl"
                class="chat-message-list__messages mx-auto flex max-w-7xl flex-col gap-2"
            >
                <template v-for="item in timeline" :key="item.key">
                    <div
                        v-if="item.kind === 'date'"
                        class="flex justify-center py-1"
                    >
                        <span
                            class="rounded-lg bg-riwaaq-surfaceHover px-3 py-1.5 text-xs font-medium text-riwaaq-textMuted shadow-sm"
                            >{{ item.label }}</span
                        >
                    </div>
                    <MessageBubble
                        v-else
                        :id="`chat-message-${item.message.id}`"
                        :message="item.message"
                        @reply="(m) => emit('reply', m)"
                        @edit="(m) => emit('edit', m)"
                    />
                </template>
            </div>
        </div>

        <button
            v-if="showScrollToBottom"
            type="button"
            title="Scroll to bottom"
            class="chat-animate-pop-in absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-riwaaq-border bg-riwaaq-surface text-riwaaq-textMuted shadow-chat-lg hover:text-riwaaq-accentText sm:right-12 z-20"
            @click="onScrollToBottomClick"
        >
            <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2.75"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M6 10l6 6 6-6" />
            </svg>
        </button>
    </div>
</template>
