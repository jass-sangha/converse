<script setup>
const ACTIONS = [
    {
        label: "Send document",
        path: "M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5Z",
    },
    {
        label: "Add contact",
        path: "M15 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2Zm9 4c-3.31 0-9 1.66-9 5v1h18v-1c0-3.34-5.69-5-9-5Z",
    },
    {
        label: "Ask Meta AI",
        path: "M12 2 9.7 8.3 3 10l6.7 1.7L12 18l2.3-6.3L21 10l-6.7-1.7Z",
    },
];
</script>

<template>
    <div
        class="cv-profile-empty-state grid h-full place-content-center bg-converse-chatBg p-6"
    >
        <div class="flex items-center gap-6">
            <div
                v-for="action in ACTIONS"
                :key="action.label"
                class="flex flex-col items-center gap-2"
                :title="action.label"
            >
                <span
                    class="flex h-11 w-11 items-center justify-center rounded-full bg-converse-surface text-converse-textMuted shadow-sm"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                    >
                        <path :d="action.path" />
                    </svg>
                </span>
                <span class="text-xs text-converse-textMuted">{{
                    action.label
                }}</span>
            </div>
        </div>
    </div>
</template>
