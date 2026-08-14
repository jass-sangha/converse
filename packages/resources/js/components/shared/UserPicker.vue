<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useUsers } from "../../composables/useUsers";
import Avatar from "./Avatar.vue";
import SearchBar from "../sidebar/SearchBar.vue";

const props = defineProps({
    multiple: { type: Boolean, default: false },
    modelValue: { type: Array, default: () => [] },
    exclude: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue"]);

const { search } = useUsers();

const state = reactive({
    query: "",
    items: [],
    page: 0,
    lastPage: 1,
    loading: false,
});
// Guards against out-of-order responses (a slow request for an older query resolving after a
// newer one) overwriting the current results — only the response matching the latest request is
// ever applied, which is what caused the list to sometimes flash empty or show stale results.
let searchToken = 0;

const scrollEl = ref(null);
const sentinelEl = ref(null);
let observer = null;

const results = computed(() =>
    state.items.filter(
        (user) =>
            !props.exclude.some(
                (u) => u.id === user.id && u.type === user.type,
            ),
    ),
);

const hasMore = computed(() => state.page < state.lastPage);

async function loadPage(reset = false) {
    if (state.loading) return;
    if (!reset && !hasMore.value) return;

    const token = ++searchToken;
    state.loading = true;
    try {
        const nextPage = reset ? 1 : state.page + 1;
        const response = await search(state.query, null, nextPage);
        if (token !== searchToken) return;

        state.items = reset ? response.data : [...state.items, ...response.data];
        state.page = response.meta?.current_page ?? nextPage;
        state.lastPage = response.meta?.last_page ?? state.page;
    } finally {
        if (token === searchToken) state.loading = false;
    }
}

function onIntersect(entries) {
    if (entries[0].isIntersecting) loadPage();
}

function setupObserver() {
    observer?.disconnect();
    if (sentinelEl.value) {
        observer = new IntersectionObserver(onIntersect, { root: scrollEl.value });
        observer.observe(sentinelEl.value);
    }
}

onMounted(() => {
    loadPage(true);
    setupObserver();
});

onBeforeUnmount(() => observer?.disconnect());

function onQuery(value) {
    state.query = value;
    state.page = 0;
    state.lastPage = 1;
    loadPage(true).then(() => nextTick(setupObserver));
}

watch(results, () => nextTick(setupObserver));

function isSelected(user) {
    return props.modelValue.some(
        (u) => u.id === user.id && u.type === user.type,
    );
}

function toggle(user) {
    if (isSelected(user)) {
        emit(
            "update:modelValue",
            props.modelValue.filter(
                (u) => !(u.id === user.id && u.type === user.type),
            ),
        );
        return;
    }

    if (props.multiple) {
        emit("update:modelValue", [...props.modelValue, user]);
    } else {
        emit("update:modelValue", [user]);
    }
}
</script>

<template>
    <div class="cv-user-picker flex h-full min-h-0 flex-col">
        <SearchBar
            :autofocus="false"
            placeholder="Search people…"
            @query="onQuery"
        />

        <div
            v-if="modelValue.length && multiple"
            class="cv-user-picker__selected mb-2 flex shrink-0 flex-wrap gap-2 px-4"
        >
            <span
                v-for="user in modelValue"
                :key="user.id"
                class="cv-user-picker__chip flex items-center gap-1.5 rounded-full bg-converse-accentTint px-3 py-1.5 text-xs font-medium text-converse-accentText"
            >
                {{ user.name }}
                <button
                    type="button"
                    class="text-converse-accentText hover:text-converse-danger"
                    @click="toggle(user)"
                >
                    ×
                </button>
            </span>
        </div>

        <ul ref="scrollEl" class="cv-user-picker__results min-h-0 flex-1 overflow-y-auto px-2 py-1">
            <li
                v-for="user in results"
                :key="user.id"
                class="cv-user-picker__result-row group relative mb-1 flex cursor-pointer items-center gap-[13px] rounded-[20px] px-3 py-3 hover:bg-converse-surfaceHover"
                @click="toggle(user)"
            >
                <div
                    v-if="isSelected(user)"
                    class="pointer-events-none absolute inset-0 rounded-[20px] bg-converse-accentTint"
                />

                <Avatar
                    class="relative shrink-0"
                    :name="user.name"
                    :avatar-url="user.avatar_url"
                    :size="46"
                />
                <span
                    class="relative min-w-0 flex-1 truncate text-[14.5px] font-semibold text-converse-text"
                    >{{ user.name }}</span
                >
                <span
                    v-if="multiple"
                    class="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                    :class="
                        isSelected(user)
                            ? 'border-converse-accent bg-converse-accent text-white'
                            : 'border-converse-border'
                    "
                >
                    <svg
                        v-if="isSelected(user)"
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        fill="currentColor"
                    >
                        <path
                            d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41Z"
                        />
                    </svg>
                </span>
            </li>
            <li v-if="hasMore" ref="sentinelEl" class="cv-user-picker__sentinel h-1" />
            <li
                v-if="state.loading"
                class="p-4 text-center text-sm text-converse-textMuted"
            >
                Loading…
            </li>
            <li
                v-if="!results.length && !state.loading"
                class="cv-user-picker__empty p-4 text-center text-sm text-converse-textMuted"
            >
                No people found.
            </li>
        </ul>
    </div>
</template>
