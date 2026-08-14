<script setup>
import { computed, ref, watch } from "vue";
import { useUsers } from "../../composables/useUsers";
import Avatar from "./Avatar.vue";

const props = defineProps({
    multiple: { type: Boolean, default: false },
    modelValue: { type: Array, default: () => [] },
    exclude: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue"]);

const { search } = useUsers();

const query = ref("");
const rawResults = ref([]);
let debounceTimer = null;

const results = computed(() =>
    rawResults.value.filter(
        (user) =>
            !props.exclude.some(
                (u) => u.id === user.id && u.type === user.type,
            ),
    ),
);

watch(query, (value) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        rawResults.value = await search(value);
    }, 250);
});

search("").then((users) => (rawResults.value = users));

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
    <div class="cv-user-picker">
        <div class="mb-3 flex items-center gap-2.5 rounded-full border border-converse-border bg-converse-surfaceHover px-4 h-11">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" class="shrink-0 text-converse-textDim">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4 4" />
            </svg>
            <input
                v-model="query"
                type="text"
                placeholder="Search people…"
                class="cv-user-picker__search-input min-w-0 flex-1 border-none bg-transparent text-[13.5px] text-converse-text outline-none"
            />
        </div>

        <div
            v-if="modelValue.length"
            class="cv-user-picker__selected mb-2 flex flex-wrap gap-2"
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

        <ul class="cv-user-picker__results overflow-y-auto">
            <li
                v-for="user in results"
                :key="user.id"
                class="cv-user-picker__result-row flex cursor-pointer items-center gap-[13px] rounded-[20px] px-3 py-3"
                :class="
                    isSelected(user)
                        ? 'bg-converse-accentTint'
                        : 'hover:bg-converse-surfaceHover'
                "
                @click="toggle(user)"
            >
                <Avatar
                    :name="user.name"
                    :avatar-url="user.avatar_url"
                    :size="46"
                />
                <span class="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-converse-text">{{
                    user.name
                }}</span>
                <span
                    class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
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
            <li
                v-if="!results.length"
                class="px-3 py-2 text-[13px] text-converse-textDim"
            >
                No people found.
            </li>
        </ul>
    </div>
</template>
