<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useConversations } from "../../composables/useConversations";
import { useExclusiveDropdown } from "../../composables/useExclusiveDropdown";
import { useDropdownPlacement } from "../../composables/useDropdownPlacement";
import Icon from "../shared/Icon.vue";

const props = defineProps({
    conversation: { type: Object, required: true },
});

const { setDisappearing } = useConversations();

const OPTIONS = [
    { key: "24h", label: "24 hours", seconds: 86400 },
    { key: "7d", label: "7 days", seconds: 604800 },
    { key: "90d", label: "90 days", seconds: 7776000 },
];

const root = ref(null);
const showMenu = ref(false);
const { opened, closed } = useExclusiveDropdown();
const { openUp, maxHeight, place } = useDropdownPlacement();

function toggleMenu() {
    if (isOn.value) {
        turnOff();
        return;
    }
    if (!showMenu.value) place(root.value, { preferredHeight: 230 });
    showMenu.value = !showMenu.value;
}

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
        document.addEventListener("click", onDocumentClick);
    } else {
        closed(close);
        document.removeEventListener("click", onDocumentClick);
    }
});

onBeforeUnmount(() => {
    closed(close);
    document.removeEventListener("click", onDocumentClick);
});

const current = computed(
    () => props.conversation.disappearing_messages_ttl || null,
);
const isOn = computed(() => !!current.value);
const currentLabel = computed(() => {
    const option = OPTIONS.find((o) => o.seconds === current.value);
    return option ? `Messages disappear after ${option.label}` : null;
});

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
    <div
        ref="root"
        class="chat-disappearing-toggle relative flex w-full cursor-pointer items-center gap-3.5 rounded-chat px-4 py-[15px] hover:bg-riwaaq-surfaceHover"
    >
        <Icon
            name="timer"
            :size="20"
            class="shrink-0"
            :class="isOn ? 'text-riwaaq-sage' : 'text-riwaaq-textMuted'"
        />
        <button type="button" class="flex-1 text-left" @click="toggleMenu">
            <span class="block text-[15px] text-nowrap text-riwaaq-text"
                >Disappearing messages</span
            >
            <span v-if="isOn" class="block text-xs text-riwaaq-textMuted">{{
                currentLabel
            }}</span>
        </button>
        <button
            type="button"
            class="relative h-[27px] w-[46px] shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-riwaaq-accent focus-visible:ring-offset-2 focus-visible:ring-offset-riwaaq-surface"
            :class="isOn ? 'bg-riwaaq-sage' : 'bg-riwaaq-border'"
            role="switch"
            :aria-checked="isOn"
            @click="toggleMenu"
        >
            <span
                class="absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow transition-[left] duration-150 ease-out"
                :class="isOn ? 'left-[22px]' : 'left-[3px]'"
            />
        </button>

        <div
            v-if="showMenu"
            class="chat-animate-pop-in absolute right-4 z-20"
            :class="openUp ? 'bottom-full mb-1' : 'top-full mt-1'"
        >
            <div
                class="w-48 overflow-y-auto rounded-chat-lg border border-riwaaq-border bg-riwaaq-surface p-2 shadow-chat-lg"
                :style="{ maxHeight: maxHeight + 'px' }"
            >
                <p
                    class="px-3.5 pb-1 pt-2 text-xs font-medium uppercase text-riwaaq-textMuted"
                >
                    Disappear after
                </p>
                <button
                    v-for="option in OPTIONS"
                    :key="option.key"
                    type="button"
                    class="block w-full rounded-full px-3.5 py-2.5 text-left text-sm text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                    @click="pick(option.seconds)"
                >
                    {{ option.label }}
                </button>
            </div>
        </div>
    </div>
</template>
