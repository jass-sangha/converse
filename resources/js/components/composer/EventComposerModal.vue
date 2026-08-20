<script setup>
import { computed, ref } from 'vue';
import Modal from '../shared/Modal.vue';
import LocationPickerModal from '../shared/LocationPickerModal.vue';
import Icon from '../shared/Icon.vue';

const emit = defineEmits(['close', 'create']);

const title = ref('');
const startsAt = ref('');
const location = ref('');
const locationCoords = ref(null);
const description = ref('');
const submitting = ref(false);
const showLocationPicker = ref(false);

const canSubmit = computed(() => title.value.trim().length > 0 && startsAt.value.length > 0);

function onLocationPicked(picked) {
    location.value = picked.name;
    locationCoords.value = { lat: picked.lat, lng: picked.lng };
    showLocationPicker.value = false;
}

function onLocationInput() {
    // Manually editing the name after picking a spot on the map means it no longer describes
    // that pin — drop the coordinates rather than silently keep sending a stale location.
    locationCoords.value = null;
}

async function submit() {
    if (!canSubmit.value || submitting.value) return;

    submitting.value = true;
    try {
        emit('create', {
            title: title.value.trim(),
            starts_at: new Date(startsAt.value).toISOString(),
            location: location.value.trim() || null,
            location_lat: locationCoords.value?.lat ?? null,
            location_lng: locationCoords.value?.lng ?? null,
            description: description.value.trim() || null,
        });
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <Modal title="Create event" @close="emit('close')">
        <label class="mb-1 block text-xs font-medium uppercase text-riwaaq-textMuted">Title</label>
        <input
            v-model="title"
            type="text"
            maxlength="255"
            placeholder="Event title"
            class="mb-4 w-full border-b border-riwaaq-border bg-transparent pb-2 text-[15px] text-riwaaq-text focus:border-riwaaq-accent focus:outline-none"
        >

        <label class="mb-1 block text-xs font-medium uppercase text-riwaaq-textMuted">Date &amp; time</label>
        <input
            v-model="startsAt"
            type="datetime-local"
            class="mb-4 w-full rounded-chat border border-riwaaq-border bg-transparent px-3 py-1.5 text-sm text-riwaaq-text focus:border-riwaaq-accent focus:outline-none"
        >

        <label class="mb-1 block text-xs font-medium uppercase text-riwaaq-textMuted">Location (optional)</label>
        <div class="mb-1 flex items-center gap-2">
            <input
                v-model="location"
                type="text"
                maxlength="255"
                placeholder="Where?"
                class="w-full rounded-chat border border-riwaaq-border bg-transparent px-3 py-1.5 text-sm text-riwaaq-text focus:border-riwaaq-accent focus:outline-none"
                @input="onLocationInput"
            >
            <button
                type="button"
                title="Choose on map"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-chat border border-riwaaq-border text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover hover:text-riwaaq-accentText"
                @click="showLocationPicker = true"
            >
                <Icon name="location-pin" :size="16" />
            </button>
        </div>
        <p v-if="locationCoords" class="mb-4 text-xs text-riwaaq-accentText">Pinned on map</p>
        <p v-else class="mb-4 text-xs text-riwaaq-textMuted">No pin selected — just a name will be shown</p>

        <label class="mb-1 block text-xs font-medium uppercase text-riwaaq-textMuted">Description (optional)</label>
        <textarea
            v-model="description"
            maxlength="1000"
            rows="3"
            placeholder="Add details"
            class="w-full rounded-chat border border-riwaaq-border bg-transparent px-3 py-1.5 text-sm text-riwaaq-text focus:border-riwaaq-accent focus:outline-none"
        />

        <template #footer>
            <button
                type="button"
                class="w-full rounded bg-riwaaq-accent py-1.5 text-sm text-white disabled:opacity-50"
                :disabled="!canSubmit || submitting"
                @click="submit"
            >
                Create event
            </button>
        </template>
    </Modal>

    <LocationPickerModal
        v-if="showLocationPicker"
        :initial-lat="locationCoords?.lat ?? null"
        :initial-lng="locationCoords?.lng ?? null"
        @close="showLocationPicker = false"
        @pick="onLocationPicked"
    />
</template>
