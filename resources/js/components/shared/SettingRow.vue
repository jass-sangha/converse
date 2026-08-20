<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import { useExclusiveDropdown } from "../../composables/useExclusiveDropdown";
import { useDropdownPlacement } from "../../composables/useDropdownPlacement";
import Icon from "./Icon.vue";

const props = defineProps({
    icon: { type: String, default: null },
    label: { type: String, required: true },
    hint: { type: String, default: null },
    isOn: { type: Boolean, default: false },
    options: { type: Array, default: () => [] },
    menuTitle: { type: String, default: "" },
});

const emit = defineEmits(["toggle", "pick"]);

const root = ref(null);
const showMenu = ref(false);
const { opened, closed } = useExclusiveDropdown();
const { openUp, maxHeight, place } = useDropdownPlacement();

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

// Off rows turn back on the instant you click them — no confirmation needed.
// On rows open a menu so turning one off always goes through a duration pick
// (the options list should include an indefinite/"always" entry for that).
function onRowClick() {
    if (props.isOn) {
        if (!showMenu.value) place(root.value, { preferredHeight: 250 });
        showMenu.value = !showMenu.value;
    } else {
        emit("toggle");
    }
}

function pick(option) {
    showMenu.value = false;
    emit("pick", option);
}
</script>

<template>
    <div ref="root" data-menu-root="1" class="chat-setting-row relative">
        <div
            class="flex w-full cursor-pointer items-center gap-3.5 rounded-chat px-4 py-[15px] hover:bg-riwaaq-surfaceHover"
            role="switch"
            :aria-checked="isOn"
            @click="onRowClick"
        >
            <Icon
                v-if="icon"
                :name="icon"
                :size="20"
                class="shrink-0 text-riwaaq-textMuted"
            />
            <span class="min-w-0 flex-1">
                <span
                    class="block text-[14px] font-semibold text-riwaaq-text"
                    >{{ label }}</span
                >
                <span
                    v-if="hint"
                    class="mt-0.5 block text-xs text-riwaaq-textMuted"
                    >{{ hint }}</span
                >
            </span>
            <span
                class="relative h-[27px] w-[46px] shrink-0 rounded-full transition-colors"
                :class="isOn ? 'bg-riwaaq-sage' : 'bg-riwaaq-border'"
            >
                <span
                    class="absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow transition-[left] duration-150 ease-out"
                    :class="isOn ? 'left-[22px]' : 'left-[3px]'"
                />
            </span>
        </div>

        <div
            v-if="isOn && showMenu"
            class="chat-animate-pop-in absolute right-4 z-20 w-[180px] overflow-y-auto rounded-chat-lg border border-riwaaq-border bg-riwaaq-surface p-2 shadow-chat-lg"
            :class="openUp ? 'bottom-full mb-1' : 'top-full mt-1'"
            :style="{ maxHeight: maxHeight + 'px' }"
        >
            <p
                v-if="menuTitle"
                class="px-3 pb-2 pt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-riwaaq-textDim"
            >
                {{ menuTitle }}
            </p>
            <button
                v-for="option in options"
                :key="option.key"
                type="button"
                class="block w-full rounded-full px-3 py-2.5 text-left text-[13px] font-medium text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="pick(option)"
            >
                {{ option.label }}
            </button>
        </div>
    </div>
</template>
