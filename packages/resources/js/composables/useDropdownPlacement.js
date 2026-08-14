import { ref } from 'vue';

// Decides whether a popover should open below or above its trigger, and how tall it can
// be, based on the space actually available in the viewport at open time. Call place()
// with the trigger element right before showing the popover (e.g. in the click handler
// that flips a v-if to true) — v-if means the popover element itself doesn't exist yet at
// that point, so this measures the trigger, not the popover.
export function useDropdownPlacement() {
    const openUp = ref(false);
    const maxHeight = ref(320);

    function place(triggerEl, { preferredHeight = 320, margin = 12 } = {}) {
        if (!triggerEl) return;

        const rect = triggerEl.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom - margin;
        const spaceAbove = rect.top - margin;

        if (spaceBelow < Math.min(preferredHeight, 160) && spaceAbove > spaceBelow) {
            openUp.value = true;
            maxHeight.value = Math.max(120, Math.min(preferredHeight, spaceAbove));
        } else {
            openUp.value = false;
            maxHeight.value = Math.max(120, Math.min(preferredHeight, spaceBelow));
        }
    }

    return { openUp, maxHeight, place };
}
