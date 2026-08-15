import { ref } from 'vue';

// The nearest scrollable ancestor clips a popover just as much as the window edge does — a
// trigger inside e.g. the message list can have plenty of *window* space below it while still
// being right at the bottom of its own scroll container. Walk up to find that real boundary
// instead of assuming the window is it.
function clippingBounds(el) {
    let node = el.parentElement;
    while (node && node !== document.body) {
        const style = getComputedStyle(node);
        if (/(auto|scroll)/.test(style.overflowY)) break;
        node = node.parentElement;
    }
    if (!node || node === document.body) {
        return { top: 0, bottom: window.innerHeight };
    }
    const rect = node.getBoundingClientRect();
    return { top: Math.max(rect.top, 0), bottom: Math.min(rect.bottom, window.innerHeight) };
}

// Decides whether a popover should open below or above its trigger, and how tall it can
// be, based on the space actually available at open time. Call place() with the trigger
// element right before showing the popover (e.g. in the click handler that flips a v-if to
// true) — v-if means the popover element itself doesn't exist yet at that point, so this
// measures the trigger, not the popover.
export function useDropdownPlacement() {
    const openUp = ref(false);
    const maxHeight = ref(320);

    function place(triggerEl, { preferredHeight = 320, margin = 12 } = {}) {
        if (!triggerEl) return;

        const bounds = clippingBounds(triggerEl);
        const rect = triggerEl.getBoundingClientRect();
        const spaceBelow = bounds.bottom - rect.bottom - margin;
        const spaceAbove = rect.top - bounds.top - margin;

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
