<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import Avatar from "./Avatar.vue";
import MediaViewerModal from "./MediaViewerModal.vue";
import CameraCapture from "../composer/CameraCapture.vue";
import { useDropdownPlacement } from "../../composables/useDropdownPlacement";

const props = defineProps({
    name: { type: String, default: "" },
    avatarUrl: { type: String, default: null },
    size: { type: Number, default: 40 },
    // When true, shows a "..." trigger with a Take photo / Upload photo / Remove photo
    // menu. When false, the avatar is view-only — clicking it just opens the photo.
    editable: { type: Boolean, default: false },
    uploading: { type: Boolean, default: false },
    // Which side the dropdown grows toward, so it stays on screen: 'left' for an avatar
    // near the left edge of the layout (it grows rightward), 'right' for one near the
    // right edge (it grows leftward, e.g. GroupInfoPanel which sits at the far right).
    menuAlign: { type: String, default: "right" },
});

const emit = defineEmits(["upload", "remove"]);

const viewerOpen = ref(false);
const menuOpen = ref(false);
const showCamera = ref(false);
const inputEl = ref(null);
const root = ref(null);
const { openUp, maxHeight, place } = useDropdownPlacement();

function openViewer() {
    if (props.avatarUrl) viewerOpen.value = true;
}

function toggleMenu() {
    if (!menuOpen.value) place(root.value, { preferredHeight: 220 });
    menuOpen.value = !menuOpen.value;
}

function onDocumentClick(event) {
    if (root.value && !root.value.contains(event.target)) {
        menuOpen.value = false;
    }
}

watch(menuOpen, (open) => {
    if (open) {
        document.addEventListener("click", onDocumentClick);
    } else {
        document.removeEventListener("click", onDocumentClick);
    }
});

onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick));

function pickUpload() {
    menuOpen.value = false;
    inputEl.value?.click();
}

function onFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) emit("upload", file);
}

function pickCamera() {
    menuOpen.value = false;
    showCamera.value = true;
}

function onCameraCaptured(file) {
    emit("upload", file);
}

function pickRemove() {
    menuOpen.value = false;
    emit("remove");
}

function pickView() {
    menuOpen.value = false;
    openViewer();
}
</script>

<template>
    <span ref="root" class="chat-avatar-photo-control group relative inline-flex shrink-0">
        <button
            type="button"
            class="relative block shrink-0 overflow-hidden rounded-full disabled:cursor-default"
            :class="editable || avatarUrl ? 'cursor-pointer' : 'cursor-default'"
            :disabled="!editable && !avatarUrl"
            :title="editable ? 'Change photo' : 'View photo'"
            @click="editable ? toggleMenu() : openViewer()"
        >
            <Avatar :name="name" :avatar-url="avatarUrl" :size="size" />

            <span
                v-if="editable || avatarUrl"
                class="absolute inset-0 flex items-center justify-center rounded-full bg-riwaaq-overlay/0 text-[10px] font-medium text-white opacity-0 transition group-hover:bg-riwaaq-overlay/40 group-hover:opacity-100"
                :class="{ 'pointer-events-none': uploading, 'bg-riwaaq-overlay/40 opacity-100': menuOpen }"
            >
                {{ editable ? (uploading ? "…" : "Edit") : "View" }}
            </span>
        </button>

        <div
            v-if="menuOpen"
            class="chat-animate-pop-in absolute z-20 w-52 overflow-y-auto rounded-[22px] border border-riwaaq-border bg-riwaaq-surface p-2 text-sm shadow-lg"
            :class="[menuAlign === 'left' ? 'left-0' : 'right-0', openUp ? 'bottom-full mb-2' : 'top-full mt-2']"
            :style="{ maxHeight: maxHeight + 'px' }"
        >
            <button
                v-if="avatarUrl"
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="pickView"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-riwaaq-textMuted"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                <span>View photo</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="pickCamera"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="shrink-0 text-riwaaq-textMuted"><path d="M9 4 7.5 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.5L15 4Zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>
                <span>Take a photo</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="pickUpload"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-riwaaq-textMuted"><path d="M12 20V9" /><path d="M7.5 13.5 12 9l4.5 4.5" /><path d="M5 4h14" /></svg>
                <span>Upload photo</span>
            </button>
            <button
                v-if="avatarUrl"
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-danger hover:bg-riwaaq-surfaceHover"
                @click="pickRemove"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="shrink-0"><path d="M15 4V3H9v1H4v2h16V4h-5ZM6 8l1 12h10l1-12H6Z" /></svg>
                <span>Remove photo</span>
            </button>
        </div>

        <input ref="inputEl" type="file" accept="image/*" class="hidden" @change="onFileChange" />

        <CameraCapture
            v-if="showCamera"
            :upload-as-attachment="false"
            @captured="onCameraCaptured"
            @close="showCamera = false"
        />

        <MediaViewerModal
            v-if="viewerOpen"
            :items="[{ url: avatarUrl, kind: 'image', original_filename: name }]"
            :index="0"
            @close="viewerOpen = false"
        />
    </span>
</template>
