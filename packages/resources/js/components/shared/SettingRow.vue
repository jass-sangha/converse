<script setup>
import { ref } from 'vue';

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

const showMenu = ref(false);
const hasMenu = props.options.length > 0;

function onRowClick() {
    if (hasMenu) showMenu.value = !showMenu.value;
}

function onSwitchClick() {
    if (!hasMenu) {
        emit('toggle');
        return;
    }
    if (props.isOn) {
        showMenu.value = false;
        emit('off');
    } else {
        showMenu.value = !showMenu.value;
    }
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
    <div class="cv-setting-row relative flex w-full items-center gap-4 px-4 py-3">
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
            :class="isOn ? 'bg-converse-accent' : 'bg-converse-border'"
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
