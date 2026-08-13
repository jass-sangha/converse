<script setup>
import { useToast } from '../../composables/useToast';

const { message, dismiss } = useToast();
</script>

<template>
    <div
        v-if="message"
        class="cv-toast pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 sm:bottom-8"
    >
        <button
            type="button"
            class="cv-animate-pop-in pointer-events-auto max-w-[90vw] truncate rounded-full bg-converse-text px-5 py-2.5 text-sm font-medium text-converse-bg shadow-lg"
            @click="dismiss"
        >
            {{ message }}
        </button>
    </div>
</template>
