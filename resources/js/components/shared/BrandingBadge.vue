<script setup>
import { useBranding } from "../../composables/useBranding";

const { showBranding } = useBranding();
</script>

<template>
    <div
        v-if="showBranding"
        class="chat-branding-badge pointer-events-none absolute bottom-2 right-3 z-10 select-none text-[11px] text-riwaaq-textDim"
    >
        Powered by Riwaaq
    </div>
</template>
