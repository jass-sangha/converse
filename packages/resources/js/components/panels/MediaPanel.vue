<script setup>
import { computed } from 'vue';
import { useChatStore } from '../../store';
import { chatableKeyOf } from '../../chatable';

const store = useChatStore();

const mediaItems = computed(() => {
    const items = [];

    for (const conversation of store.conversations) {
        const messages = store.messagesByConversation[conversation.id] ?? [];

        for (const message of messages) {
            if (message.deleted_for_everyone) continue;
            if (message.type !== 'image' && message.type !== 'video') continue;

            for (const attachment of message.attachments ?? []) {
                items.push({
                    key: `${message.id}-${attachment.id}`,
                    conversationName: conversation.type === 'group' ? (conversation.name || 'Group') : null,
                    type: message.type,
                    url: attachment.url ?? attachment.thumbnail_url,
                    createdAt: message.created_at,
                    isOwn: chatableKeyOf(message) === store.currentKey,
                });
            }
        }
    }

    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});
</script>

<template>
    <div class="cv-media-panel flex h-full flex-col bg-converse-surface">
        <div class="cv-media-panel__header flex items-center gap-3 border-b border-converse-border px-4 py-3">
            <h1 class="text-lg font-semibold text-converse-text">Media</h1>
        </div>

        <div class="cv-media-panel__body flex-1 overflow-y-auto p-3">
            <p v-if="!mediaItems.length" class="cv-media-panel__empty p-4 text-center text-sm text-converse-textMuted">
                Photos and videos from your open chats will show up here.
            </p>

            <div v-else class="cv-media-panel__grid grid grid-cols-3 gap-1">
                <div
                    v-for="item in mediaItems"
                    :key="item.key"
                    class="cv-media-panel__item relative aspect-square overflow-hidden rounded-sm bg-converse-surfaceHover"
                    :title="item.conversationName ?? ''"
                >
                    <video v-if="item.type === 'video'" :src="item.url" class="h-full w-full object-cover" muted />
                    <img v-else :src="item.url" :alt="item.conversationName ?? 'media'" class="h-full w-full object-cover">
                </div>
            </div>
        </div>
    </div>
</template>
