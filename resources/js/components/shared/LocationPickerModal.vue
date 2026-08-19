<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Modal from "./Modal.vue";

// Vite bundles Leaflet's default marker images under hashed URLs — its built-in icon path
// resolution assumes the unbundled dist layout and silently renders no icon at all otherwise.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [20, 0];
const DEFAULT_ZOOM = 2;

const props = defineProps({
    initialLat: { type: Number, default: null },
    initialLng: { type: Number, default: null },
});

const emit = defineEmits(["close", "pick"]);

const query = ref("");
const results = ref([]);
const searching = ref(false);
const selected = ref(null);
const mapEl = ref(null);

let map = null;
let marker = null;
let debounceTimer = null;
let searchAbort = null;

function setMarker(lat, lng, panTo = true) {
    if (!map) return;

    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on("dragend", () => {
            const pos = marker.getLatLng();
            reverseGeocode(pos.lat, pos.lng);
        });
    }

    if (panTo) map.setView([lat, lng], Math.max(map.getZoom(), 15));
}

async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        );
        const data = await response.json();
        selected.value = {
            name: data.name || data.display_name?.split(",")[0] || "Dropped pin",
            address: data.display_name || "",
            lat,
            lng,
        };
    } catch {
        selected.value = { name: "Dropped pin", address: "", lat, lng };
    }
}

function onMapClick(event) {
    const { lat, lng } = event.latlng;
    setMarker(lat, lng, false);
    reverseGeocode(lat, lng);
}

watch(query, (value) => {
    clearTimeout(debounceTimer);

    if (!value.trim()) {
        results.value = [];
        return;
    }

    debounceTimer = setTimeout(async () => {
        searching.value = true;
        searchAbort?.abort();
        searchAbort = new AbortController();

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(value)}`,
                { signal: searchAbort.signal },
            );
            results.value = await response.json();
        } catch (error) {
            if (error.name !== "AbortError") results.value = [];
        } finally {
            searching.value = false;
        }
    }, 400);
});

function pickResult(result) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    selected.value = {
        name: result.display_name.split(",")[0],
        address: result.display_name,
        lat,
        lng,
    };

    setMarker(lat, lng);
    results.value = [];
    query.value = "";
}

function confirm() {
    if (!selected.value) return;
    emit("pick", selected.value);
}

onMounted(() => {
    const hasInitial = props.initialLat !== null && props.initialLng !== null;

    map = L.map(mapEl.value).setView(
        hasInitial ? [props.initialLat, props.initialLng] : DEFAULT_CENTER,
        hasInitial ? 15 : DEFAULT_ZOOM,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", onMapClick);

    if (hasInitial) {
        setMarker(props.initialLat, props.initialLng, false);
        reverseGeocode(props.initialLat, props.initialLng);
    }
});

onBeforeUnmount(() => {
    clearTimeout(debounceTimer);
    searchAbort?.abort();
    map?.remove();
    map = null;
});
</script>

<template>
    <Modal title="Choose location" @close="emit('close')">
        <div class="relative mb-3">
            <input
                v-model="query"
                type="text"
                placeholder="Search for a place"
                class="w-full rounded-chat border border-riwaaq-border bg-transparent px-3 py-1.5 text-sm text-riwaaq-text focus:border-riwaaq-accent focus:outline-none"
            >
            <div
                v-if="results.length"
                class="absolute inset-x-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-chat border border-riwaaq-border bg-riwaaq-surface shadow-chat-lg"
            >
                <button
                    v-for="result in results"
                    :key="result.place_id"
                    type="button"
                    class="block w-full truncate px-3 py-2 text-left text-sm text-riwaaq-text hover:bg-riwaaq-surfaceHover"
                    @click="pickResult(result)"
                >
                    {{ result.display_name }}
                </button>
            </div>
        </div>

        <div ref="mapEl" class="chat-location-picker__map h-72 w-full overflow-hidden rounded-chat border border-riwaaq-border" />

        <p class="mt-2 text-xs text-riwaaq-textMuted">Tap the map or drag the pin to fine-tune the spot.</p>

        <div v-if="selected" class="mt-3 rounded-chat bg-riwaaq-surfaceHover p-2.5">
            <p class="truncate text-sm font-medium text-riwaaq-text">{{ selected.name }}</p>
            <p class="truncate text-xs text-riwaaq-textMuted">{{ selected.address }}</p>
        </div>

        <template #footer>
            <button
                type="button"
                class="w-full rounded bg-riwaaq-accent py-1.5 text-sm text-white disabled:opacity-50"
                :disabled="!selected"
                @click="confirm"
            >
                Use this location
            </button>
        </template>
    </Modal>
</template>
