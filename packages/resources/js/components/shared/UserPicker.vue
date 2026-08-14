<script setup>
import { computed, ref } from "vue";
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

const rawResults = ref([]);

const results = computed(() =>
    rawResults.value.filter(
        (user) =>
            !props.exclude.some(
                (u) => u.id === user.id && u.type === user.type,
            ),
    ),
);

async function onQuery(value) {
    rawResults.value = await search(value);
}

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

        <ul class="cv-user-picker__results min-h-0 flex-1 overflow-y-auto px-2 py-1">
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
            <li
                v-if="!results.length"
                class="cv-user-picker__empty p-4 text-center text-sm text-converse-textMuted"
            >
                No people found.
            </li>
        </ul>
    </div>
</template>
