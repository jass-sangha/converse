<script setup>
import { computed } from 'vue';
import { useUsers } from '../../composables/useUsers';

const props = defineProps({
    replyTo: { type: Object, required: true },
    dismissible: { type: Boolean, default: false },
    isOwn: { type: Boolean, default: false },
});

defineEmits(['dismiss']);

const { get } = useUsers();

const whoName = computed(() => get({ type: props.replyTo.chatable_type, id: props.replyTo.chatable_id }).name);
</script>

<template>
    <div
        v-if="dismissible"
        class="cv-reply-preview flex items-center gap-3 rounded-[18px] bg-converse-surface px-4 py-2.5 shadow-sm"
    >
        <span class="shrink-0 self-stretch rounded-full bg-converse-accent" style="width: 3px" />
        <div class="min-w-0 flex-1">
            <p class="text-[11.5px] font-bold text-converse-accentText">Replying to {{ whoName }}</p>
            <p class="truncate text-[12.5px] text-converse-textMuted">{{ replyTo.body }}</p>
        </div>
        <button
            type="button"
            title="Cancel reply"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover"
            @click="$emit('dismiss')"
        >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
    </div>

    <div
        v-else
        class="cv-reply-preview rounded-[14px] px-[11px] py-[7px]"
        :class="isOwn ? 'bg-[rgba(140,73,26,.1)]' : 'bg-converse-surfaceHover'"
    >
        <p class="text-[11.5px] font-bold text-converse-accentText">{{ whoName }}</p>
        <p class="mt-px truncate text-[12.5px] text-converse-textMuted">{{ replyTo.body }}</p>
    </div>
</template>
