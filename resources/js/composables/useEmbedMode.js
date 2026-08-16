import { computed } from 'vue';

// window.ConverseConfig is set once, in a static <script> tag, before this
// module ever loads — a plain computed (not a ref) is enough, matching the
// other window.ConverseConfig-derived singletons in this codebase.
const isEmbedded = computed(() => Boolean(window.ConverseConfig?.embed));

export function useEmbedMode() {
    return { isEmbedded };
}
