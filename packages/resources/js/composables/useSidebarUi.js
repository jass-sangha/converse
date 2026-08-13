import { ref } from 'vue';

// Which sidebar pane the icon rail is showing.
const view = ref('chats');
// Which filter pill is active within the chats pane.
const filter = ref('all');

export function useSidebarUi() {
    function setView(value) {
        view.value = value;
    }

    function setFilter(value) {
        filter.value = value;
    }

    return { view, setView, filter, setFilter };
}
