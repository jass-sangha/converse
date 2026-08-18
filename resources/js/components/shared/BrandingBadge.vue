<script setup>
import { useBranding } from "../../composables/useBranding";

const { showBranding } = useBranding();
</script>

<template>
    <div
        v-if="showBranding"
        class="cv-branding-badge pointer-events-none absolute bottom-2 right-3 z-10 select-none text-[11px] text-converse-textDim"
    >
        Powered by Converse
    </div>
</template>
