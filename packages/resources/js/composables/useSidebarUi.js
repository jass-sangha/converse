import { ref } from 'vue';

// Which sidebar pane the icon rail is showing.
const view = ref('chats');
// Which filter pill is active within the chats pane.
const filter = ref('all');
const searchOpen = ref(false);

export function useSidebarUi() {
    function setView(value) {
        view.value = value;
        if (value !== 'chats') {
            searchOpen.value = false;
        }
    }

    function setFilter(value) {
        filter.value = value;
    }

    function toggleSearch() {
        searchOpen.value = !searchOpen.value;
    }

    return { view, setView, filter, setFilter, searchOpen, toggleSearch };
}
