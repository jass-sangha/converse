import { ref } from 'vue';

const message = ref(null);
let hideTimer = null;

export function useToast() {
    function show(text, { duration = 3000 } = {}) {
        clearTimeout(hideTimer);
        message.value = text;
        hideTimer = setTimeout(() => {
            message.value = null;
        }, duration);
    }

    function dismiss() {
        clearTimeout(hideTimer);
        message.value = null;
    }

    return { message, show, dismiss };
}
