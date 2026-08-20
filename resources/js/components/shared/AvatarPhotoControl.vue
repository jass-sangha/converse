<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import Avatar from "./Avatar.vue";
import MediaViewerModal from "./MediaViewerModal.vue";
import CameraCapture from "../composer/CameraCapture.vue";
import Icon from "./Icon.vue";
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
            class="chat-animate-pop-in absolute z-20 w-52 overflow-y-auto rounded-chat-lg border border-riwaaq-border bg-riwaaq-surface p-2 text-sm shadow-chat-lg"
            :class="[menuAlign === 'left' ? 'left-0' : 'right-0', openUp ? 'bottom-full mb-2' : 'top-full mt-2']"
            :style="{ maxHeight: maxHeight + 'px' }"
        >
            <button
                v-if="avatarUrl"
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="pickView"
            >
                <Icon name="eye" :size="16" class="shrink-0 text-riwaaq-textMuted" />
                <span>View photo</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="pickCamera"
            >
                <Icon name="camera-solid" :size="16" class="shrink-0 text-riwaaq-textMuted" />
                <span>Take a photo</span>
            </button>
            <button
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                @click="pickUpload"
            >
                <Icon name="upload" :size="16" class="shrink-0 text-riwaaq-textMuted" />
                <span>Upload photo</span>
            </button>
            <button
                v-if="avatarUrl"
                type="button"
                class="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-riwaaq-danger hover:bg-riwaaq-surfaceHover"
                @click="pickRemove"
            >
                <Icon name="trash-alt" :size="16" class="shrink-0" />
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
