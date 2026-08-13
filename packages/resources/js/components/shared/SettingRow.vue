<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useExclusiveDropdown } from '../../composables/useExclusiveDropdown';

const props = defineProps({
    icon: { type: String, required: true },
    label: { type: String, required: true },
    subtitle: { type: String, default: null },
    isOn: { type: Boolean, default: false },
    options: { type: Array, default: () => [] },
    menuTitle: { type: String, default: '' },
    offLabel: { type: String, default: 'Off' },
});

const emit = defineEmits(['toggle', 'pick', 'off']);

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

// A row always has *something* to show in its dropdown once it's on (at minimum the "Off"
// entry below), even with no `options` list — a plain boolean row (no duration/options) still
// needs that same menu, just without a picker list above the Off button.
const hasMenu = computed(() => props.options.length > 0 || props.isOn);

// Switch and row both do the exact same thing: if there's a menu to show (any options, or
// just the Off entry once on), open it — never toggle instantly. That keeps a labeled "Off"
// button always the one and only way to turn a row off, instead of the switch silently doing
// it with no visible control.
function onRowClick() {
    if (hasMenu.value) {
        showMenu.value = !showMenu.value;
    } else {
        emit('toggle');
    }
}

function onSwitchClick() {
    onRowClick();
}

function pick(option) {
    showMenu.value = false;
    emit('pick', option);
}

function turnOff() {
    showMenu.value = false;
    emit('off');
}
</script>

<template>
    <div ref="root" class="cv-setting-row relative flex w-full items-center gap-4 px-4 py-3">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" class="shrink-0 text-converse-textMuted">
            <path :d="icon" />
        </svg>
        <button type="button" class="flex-1 text-left" :class="{ 'cursor-default': !hasMenu }" @click="onRowClick">
            <span class="block text-[15px] text-converse-text">{{ label }}</span>
            <span v-if="isOn && subtitle" class="block text-xs text-converse-textMuted">{{ subtitle }}</span>
        </button>
        <button
            type="button"
            class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-converse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-converse-surface"
            :class="isOn ? 'bg-converse-sage' : 'bg-converse-border'"
            role="switch"
            :aria-checked="isOn"
            @click="onSwitchClick"
        >
            <span
                class="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-converse-accentContrast shadow transition-transform"
                :class="isOn ? 'translate-x-5' : 'translate-x-0.5'"
            />
        </button>

        <div v-if="hasMenu && showMenu" class="cv-animate-pop-in absolute right-4 top-full z-20 mt-1">
            <div class="w-44 rounded-cv border border-converse-border bg-converse-surface py-1 shadow-lg">
                <p v-if="menuTitle" class="px-3 pb-1 pt-2 text-xs font-medium uppercase text-converse-textMuted">{{ menuTitle }}</p>
                <button
                    v-for="option in options"
                    :key="option.key"
                    type="button"
                    class="block w-full px-3 py-2 text-left text-sm text-converse-text hover:bg-converse-surfaceHover"
                    @click="pick(option)"
                >
                    {{ option.label }}
                </button>
                <template v-if="isOn">
                    <div class="my-1 border-t border-converse-border" />
                    <button type="button" class="block w-full px-3 py-2 text-left text-sm text-converse-accent hover:bg-converse-surfaceHover" @click="turnOff">
                        {{ offLabel }}
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>
