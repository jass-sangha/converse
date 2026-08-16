<script setup>
import { useToast } from '../../composables/useToast';

const { message, dismiss } = useToast();
</script>

<template>
    <div
        v-if="message"
        class="cv-toast pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 sm:bottom-8"
    >
        <div
            class="cv-animate-pop-in pointer-events-auto flex max-w-[90vw] items-center gap-3 rounded-full border border-converse-border bg-converse-surface px-5 py-3 text-[13px] font-medium text-converse-text shadow-lg"
        >
            <span class="truncate">{{ message }}</span>
            <button
                type="button"
                class="shrink-0 text-xs font-bold text-converse-accentText hover:underline"
                @click="dismiss"
            >
                Dismiss
            </button>
        </div>
    </div>
</template>
