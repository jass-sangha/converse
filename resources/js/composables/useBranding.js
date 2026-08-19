import { computed } from 'vue';

// window.RiwaaqConfig is set once, in a static <script> tag, before this module ever
// loads — a plain computed (not a ref) is enough, matching the other
// window.RiwaaqConfig-derived singletons in this codebase (see useEmbedMode.js).
const showBranding = computed(() => Boolean(window.RiwaaqConfig?.showBranding));

export function useBranding() {
    return { showBranding };
}
