<script setup>
import { ref, watch } from 'vue';
import { useUsers } from '../../composables/useUsers';
import Avatar from './Avatar.vue';

const props = defineProps({
    multiple: { type: Boolean, default: false },
    modelValue: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue']);

const { search } = useUsers();

const query = ref('');
const results = ref([]);
let debounceTimer = null;

watch(query, (value) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        results.value = await search(value);
    }, 250);
});

search('').then((users) => (results.value = users));

function isSelected(user) {
    return props.modelValue.some((u) => u.id === user.id && u.type === user.type);
}

function toggle(user) {
    if (isSelected(user)) {
        emit('update:modelValue', props.modelValue.filter((u) => !(u.id === user.id && u.type === user.type)));
        return;
    }

    if (props.multiple) {
        emit('update:modelValue', [...props.modelValue, user]);
    } else {
        emit('update:modelValue', [user]);
    }
}
</script>

<template>
    <div class="cv-user-picker">
        <input
            v-model="query"
            type="text"
            placeholder="Search people…"
            class="cv-user-picker__search-input mb-2 w-full rounded border border-converse-border bg-converse-surface px-3 py-2 text-sm text-converse-text focus:border-converse-accent focus:outline-none"
        >

        <div v-if="modelValue.length" class="cv-user-picker__selected mb-2 flex flex-wrap gap-2">
            <span
                v-for="user in modelValue"
                :key="user.id"
                class="cv-user-picker__chip flex items-center gap-1 rounded-full bg-converse-accent/15 px-2 py-1 text-xs text-converse-accent"
            >
                {{ user.name }}
                <button type="button" class="text-converse-accent hover:text-converse-danger" @click="toggle(user)">×</button>
            </span>
        </div>

        <ul class="cv-user-picker__results max-h-64 overflow-y-auto rounded border border-converse-border">
            <li
                v-for="user in results"
                :key="user.id"
                class="cv-user-picker__result-row flex cursor-pointer items-center gap-3 px-3 py-2"
                :class="isSelected(user) ? 'bg-converse-accent/10' : 'hover:bg-converse-surfaceHover'"
                @click="toggle(user)"
            >
                <Avatar :name="user.name" :avatar-url="user.avatar_url" :size="32" />
                <span class="flex-1 text-sm text-converse-text">{{ user.name }}</span>
                <span
                    class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                    :class="isSelected(user) ? 'border-converse-accent bg-converse-accent text-white' : 'border-converse-border'"
                >
                    <svg v-if="isSelected(user)" viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41Z"/></svg>
                </span>
            </li>
            <li v-if="!results.length" class="px-3 py-2 text-sm text-converse-textMuted">No people found.</li>
        </ul>
    </div>
</template>
