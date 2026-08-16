<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import { useExclusiveDropdown } from "../../composables/useExclusiveDropdown";
import { useDropdownPlacement } from "../../composables/useDropdownPlacement";

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
    <div ref="root" data-menu-root="1" class="cv-setting-row relative">
        <div
            class="flex w-full cursor-pointer items-center gap-3.5 rounded-[20px] px-4 py-[15px] hover:bg-converse-surfaceHover"
            role="switch"
            :aria-checked="isOn"
            @click="onRowClick"
        >
            <svg
                v-if="icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                class="shrink-0 text-converse-textMuted"
            >
                <path :d="icon" />
            </svg>
            <span class="min-w-0 flex-1">
                <span
                    class="block text-[14px] font-semibold text-converse-text"
                    >{{ label }}</span
                >
                <span
                    v-if="hint"
                    class="mt-0.5 block text-xs text-converse-textMuted"
                    >{{ hint }}</span
                >
            </span>
            <span
                class="relative h-[27px] w-[46px] shrink-0 rounded-full transition-colors"
                :class="isOn ? 'bg-converse-sage' : 'bg-converse-border'"
            >
                <span
                    class="absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow transition-[left] duration-150 ease-out"
                    :class="isOn ? 'left-[22px]' : 'left-[3px]'"
                />
            </span>
        </div>

        <div
            v-if="isOn && showMenu"
            class="cv-animate-pop-in absolute right-4 z-20 w-[180px] overflow-y-auto rounded-[22px] border border-converse-border bg-converse-surface p-2 shadow-lg"
            :class="openUp ? 'bottom-full mb-1' : 'top-full mt-1'"
            :style="{ maxHeight: maxHeight + 'px' }"
        >
            <p
                v-if="menuTitle"
                class="px-3 pb-2 pt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-converse-textDim"
            >
                {{ menuTitle }}
            </p>
            <button
                v-for="option in options"
                :key="option.key"
                type="button"
                class="block w-full rounded-full px-3 py-2.5 text-left text-[13px] font-medium text-converse-text hover:bg-converse-surfaceHover"
                @click="pick(option)"
            >
                {{ option.label }}
            </button>
        </div>
    </div>
</template>
