<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import { useSidebarUi } from "../../composables/useSidebarUi";
import { usePreferences } from "../../composables/usePreferences";

const { setView } = useSidebarUi();
const { effectiveTheme, toggleTheme } = usePreferences();

const showMenu = ref(false);
const menuRoot = ref(null);

function onDocumentClick(event) {
    if (menuRoot.value && !menuRoot.value.contains(event.target)) {
        showMenu.value = false;
    }
}

watch(showMenu, (open) => {
    if (open) {
        document.addEventListener("click", onDocumentClick);
    } else {
        document.removeEventListener("click", onDocumentClick);
    }
});

onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick));

function go(view) {
    setView(view);
    showMenu.value = false;
}
</script>

<template>
    <div ref="menuRoot" class="cv-global-menu relative shrink-0">
        <button
            type="button"
            title="Menu"
            class="flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
            @click="showMenu = !showMenu"
        >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path
                    d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
                />
            </svg>
        </button>

        <div
            v-if="showMenu"
            class="cv-animate-pop-in absolute right-0 top-full z-20 w-56 rounded-[22px] border border-converse-border bg-converse-surface p-2 text-sm shadow-lg"
        >
            <button
                type="button"
                class="block w-full rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="go('new-chat')"
            >
                New chat
            </button>
            <button
                type="button"
                class="block w-full rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="go('new-group')"
            >
                New group
            </button>
            <button
                type="button"
                class="block w-full rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="go('starred')"
            >
                Starred messages
            </button>
            <button
                type="button"
                class="block w-full rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="go('archived')"
            >
                Archived chats
            </button>
            <button
                type="button"
                class="block w-full rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="go('media')"
            >
                Media
            </button>
            <button
                type="button"
                class="block w-full rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="go('profile')"
            >
                Settings
            </button>
            <button
                type="button"
                class="block w-full rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover"
                @click="
                    toggleTheme();
                    showMenu = false;
                "
            >
                {{ effectiveTheme === "dark" ? "Light mode" : "Dark mode" }}
            </button>
        </div>
    </div>
</template>
