<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

defineProps({
    pinned: { type: Boolean, default: false },
    favourited: { type: Boolean, default: false },
    muted: { type: Boolean, default: false },
    isGroup: { type: Boolean, default: false },
});

const emit = defineEmits(['mute', 'unmute', 'pin', 'unpin', 'favourite', 'unfavourite', 'delete', 'leave']);

const open = ref(false);
const root = ref(null);

function act(action) {
    open.value = false;
    emit(action);
}

function onDocumentClick(event) {
    if (root.value && !root.value.contains(event.target)) {
        open.value = false;
    }
}

watch(open, (isOpen) => {
    if (isOpen) {
        document.addEventListener('click', onDocumentClick);
    } else {
        document.removeEventListener('click', onDocumentClick);
    }
});

onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick));
</script>

<template>
    <div ref="root" class="cv-conversation-menu relative" @click.stop>
        <button
            type="button"
            class="cv-conversation-menu__trigger px-1 text-lg leading-none text-converse-textMuted hover:text-converse-text"
            title="Conversation options"
            @click="open = !open"
        >
            ⋮
        </button>

        <div
            v-if="open"
            class="cv-conversation-menu__dropdown cv-animate-pop-in absolute right-0 z-20 w-40 rounded-cv border border-converse-border bg-converse-surface py-1 text-sm shadow-lg"
        >
            <button
                type="button"
                class="cv-conversation-menu__item block w-full px-3 py-1.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="act(muted ? 'unmute' : 'mute')"
            >
                {{ muted ? 'Unmute' : 'Mute' }}
            </button>
            <button
                type="button"
                class="cv-conversation-menu__item block w-full px-3 py-1.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="act(pinned ? 'unpin' : 'pin')"
            >
                {{ pinned ? 'Unpin' : 'Pin' }}
            </button>
            <button
                type="button"
                class="cv-conversation-menu__item block w-full px-3 py-1.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="act(favourited ? 'unfavourite' : 'favourite')"
            >
                {{ favourited ? 'Remove from favourites' : 'Add to favourites' }}
            </button>
            <button
                type="button"
                class="cv-conversation-menu__item block w-full px-3 py-1.5 text-left text-converse-danger hover:bg-converse-surfaceHover"
                @click="act('delete')"
            >
                Delete chat
            </button>
            <button
                v-if="isGroup"
                type="button"
                class="cv-conversation-menu__item block w-full px-3 py-1.5 text-left text-converse-danger hover:bg-converse-surfaceHover"
                @click="act('leave')"
            >
                Leave group
            </button>
        </div>
    </div>
</template>
