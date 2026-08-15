<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import CameraCapture from "./CameraCapture.vue";
import { useMessages } from "../../composables/useMessages";
import { useToast } from "../../composables/useToast";
import { useExclusiveDropdown } from "../../composables/useExclusiveDropdown";

const emit = defineEmits(["uploaded", "create-poll", "create-event"]);

const OPTIONS = [
    {
        key: "files",
        label: "Files",
        accept: "",
        path: "M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm11 10.5-2.5-3-3.5 4.5H16Zm-8-6.5A1.5 1.5 0 1 0 7 9.5 1.5 1.5 0 0 0 7 6Z",
    },
    {
        key: "camera",
        label: "Camera",
        path: "M9 4 7.5 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.5L15 4Zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
    },
    {
        key: "sticker",
        label: "Sticker",
        accept: "image/png,image/webp,image/gif",
        forcedType: "sticker",
        path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-3.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 17c-2.5 0-4.6-1.5-5.4-3.6h10.8C16.6 15.5 14.5 17 12 17Z",
    },
    {
        key: "poll",
        label: "Poll",
        path: "M4 4h2v16H4Zm14 6h2v10h-2Zm-7-3h2v13h-2Z",
    },
    // {
    //     key: "event",
    //     label: "Event",
    //     path: "M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2Zm-2 8h14v10H5Z",
    // },
];

const { uploadAttachment } = useMessages();
const { show: showToast } = useToast();
const inputEl = ref(null);
const uploading = ref(false);
const showMenu = ref(false);
const showCamera = ref(false);
const root = ref(null);
let forcedType = null;

const { opened: dropdownOpened, closed: dropdownClosed } =
    useExclusiveDropdown();

function closeMenu() {
    showMenu.value = false;
}

function toggleMenu() {
    showMenu.value = !showMenu.value;
}

function onDocumentClick(event) {
    if (root.value && !root.value.contains(event.target)) {
        closeMenu();
    }
}

watch(showMenu, (open) => {
    if (open) {
        document.addEventListener("click", onDocumentClick);
        dropdownOpened(closeMenu);
    } else {
        document.removeEventListener("click", onDocumentClick);
        dropdownClosed(closeMenu);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener("click", onDocumentClick);
    dropdownClosed(closeMenu);
});

function pick(option) {
    if (option.disabled) return;
    showMenu.value = false;

    if (option.key === "camera") {
        showCamera.value = true;
        return;
    }

    if (option.key === "poll") {
        emit("create-poll");
        return;
    }

    if (option.key === "event") {
        emit("create-event");
        return;
    }

    forcedType = option.forcedType ?? null;
    inputEl.value.accept = option.accept ?? "";
    inputEl.value.click();
}

function resolveType(mimeType) {
    if (forcedType) return forcedType;
    if (mimeType === "image/gif") return "gif";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "document";
}

async function onChange(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    uploading.value = true;
    try {
        const uploaded = [];

        // One rejected file (too large, e.g.) shouldn't block the rest of a multi-select from
        // uploading — collect failures and report them together once the batch is done.
        const failures = [];
        for (const file of files) {
            try {
                const attachment = await uploadAttachment(file);
                uploaded.push({
                    attachment,
                    type: resolveType(attachment.mime_type),
                });
            } catch (e) {
                failures.push(
                    e.response?.data?.message ??
                        `Couldn't upload "${file.name}".`,
                );
            }
        }

        if (uploaded.length) emit("uploaded", uploaded);
        if (failures.length) showToast([...new Set(failures)].join(" "));
    } finally {
        uploading.value = false;
        forcedType = null;
    }
}
</script>

<template>
    <div ref="root" class="cv-attachment-picker relative">
        <button
            type="button"
            title="Attach"
            class="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-converse-surface text-converse-textMuted shadow-sm hover:text-converse-accent disabled:opacity-50"
            :disabled="uploading"
            @click="toggleMenu"
        >
            <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="2.75"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path
                    d="M21 12.5 12.8 20.7a5 5 0 0 1-7.1-7.1L14 5.3a3.4 3.4 0 0 1 4.8 4.8l-8.2 8.2a1.8 1.8 0 0 1-2.5-2.5l7.6-7.6"
                />
            </svg>
        </button>

        <div
            v-if="showMenu"
            class="cv-attachment-picker__menu cv-animate-pop-in absolute bottom-14 left-0 z-20 w-52 rounded-[22px] border border-converse-border bg-converse-surface p-2 text-sm shadow-lg"
        >
            <button
                v-for="option in OPTIONS"
                :key="option.key"
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-converse-text hover:bg-converse-surfaceHover disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="option.disabled"
                :title="option.disabled ? 'Not available yet' : option.label"
                @click="pick(option)"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="shrink-0 text-converse-textMuted"
                >
                    <path :d="option.path" />
                </svg>
                <span>{{ option.label }}</span>
            </button>
        </div>

        <input
            ref="inputEl"
            type="file"
            multiple
            class="hidden"
            @change="onChange"
        />

        <CameraCapture
            v-if="showCamera"
            @close="showCamera = false"
            @uploaded="(payload) => emit('uploaded', [payload])"
        />
    </div>
</template>
