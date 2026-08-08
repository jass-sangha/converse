import { onUnmounted } from 'vue';

export function useResizable(widthRef, { min = 240, max = 480, invert = false } = {}) {
    let dragging = false;
    let startX = 0;
    let startWidth = 0;

    function onMove(event) {
        if (!dragging) return;
        const delta = event.clientX - startX;
        const next = startWidth + (invert ? -delta : delta);
        widthRef.value = Math.min(max, Math.max(min, next));
    }

    function onUp() {
        dragging = false;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
    }

    function startDrag(event) {
        dragging = true;
        startX = event.clientX;
        startWidth = widthRef.value;
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        event.preventDefault();
    }

    onUnmounted(onUp);

    return { startDrag };
}
