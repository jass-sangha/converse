// Shared across every consumer (a true module singleton, unlike a ref declared inside a
// component's own <script setup> which is re-created per instance): opening a dropdown closes
// whichever one — anywhere in the app — was previously open, without needing a click-outside
// listener. Each open dropdown registers its own close callback here.
let activeClose = null;

export function useExclusiveDropdown() {
    function opened(close) {
        if (activeClose && activeClose !== close) {
            activeClose();
        }
        activeClose = close;
    }

    function closed(close) {
        if (activeClose === close) {
            activeClose = null;
        }
    }

    return { opened, closed };
}
