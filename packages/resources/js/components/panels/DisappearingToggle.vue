<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useConversations } from '../../composables/useConversations';
import { useExclusiveDropdown } from '../../composables/useExclusiveDropdown';

const props = defineProps({
    conversation: { type: Object, required: true },
});

const { setDisappearing } = useConversations();

const OPTIONS = [
    { key: '24h', label: '24 hours', seconds: 86400 },
    { key: '7d', label: '7 days', seconds: 604800 },
    { key: '90d', label: '90 days', seconds: 7776000 },
];

const root = ref(null);
const showMenu = ref(false);
const { opened, closed } = useExclusiveDropdown();

function close() {
    showMenu.value = false;
}

function onDocumentClick(event) {
    if (root.value && !root.value.contains(event.target)) {
        close();
    }
}

watch(showMenu, (open) => {
    if (open) {
        opened(close);
        document.addEventListener('click', onDocumentClick);
    } else {
        closed(close);
        document.removeEventListener('click', onDocumentClick);
    }
});

onBeforeUnmount(() => {
    closed(close);
    document.removeEventListener('click', onDocumentClick);
});

const current = computed(() => props.conversation.disappearing_messages_ttl || null);
const isOn = computed(() => !!current.value);
const currentLabel = computed(() => OPTIONS.find((o) => o.seconds === current.value)?.label ?? null);

function pick(seconds) {
    showMenu.value = false;
    setDisappearing(props.conversation.id, seconds);
}

function turnOff() {
    showMenu.value = false;
    setDisappearing(props.conversation.id, null);
}
</script>

<template>
    <div ref="root" class="cv-disappearing-toggle relative flex w-full items-center gap-4 px-4 py-3">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" class="shrink-0 text-converse-textMuted">
            <path d="M15 1H9v2h6Zm-4 13h2V8h-2Zm8.03-6.61 1.42-1.42a13.98 13.98 0 0 0-1.42-1.42l-1.42 1.42A9 9 0 1 0 21 12a8.96 8.96 0 0 0-1.97-5.61ZM12 20a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" />
        </svg>
        <button type="button" class="flex-1 text-left" @click="showMenu = !showMenu">
            <span class="block text-[15px] text-converse-text">Disappearing messages</span>
            <span v-if="isOn" class="block text-xs text-converse-textMuted">{{ currentLabel }}</span>
        </button>
        <button
            type="button"
            class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-converse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-converse-surface"
            :class="isOn ? 'bg-converse-accent' : 'bg-converse-border'"
            role="switch"
            :aria-checked="isOn"
            @click="showMenu = !showMenu"
        >
            <span
                class="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-converse-accentContrast shadow transition-transform"
                :class="isOn ? 'translate-x-5' : 'translate-x-0.5'"
            />
        </button>

        <div v-if="showMenu" class="cv-animate-pop-in absolute right-4 top-full z-20 mt-1">
            <div class="w-44 rounded-cv border border-converse-border bg-converse-surface py-1 shadow-lg">
                <p class="px-3 pb-1 pt-2 text-xs font-medium uppercase text-converse-textMuted">Disappear after</p>
                <button
                    v-for="option in OPTIONS"
                    :key="option.key"
                    type="button"
                    class="block w-full px-3 py-2 text-left text-sm text-converse-text hover:bg-converse-surfaceHover"
                    @click="pick(option.seconds)"
                >
                    {{ option.label }}
                </button>
                <template v-if="isOn">
                    <div class="my-1 border-t border-converse-border" />
                    <button type="button" class="block w-full px-3 py-2 text-left text-sm text-converse-accent hover:bg-converse-surfaceHover" @click="turnOff">
                        Off
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>
