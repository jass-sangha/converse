<script setup>
import { useUsers } from '../../composables/useUsers';

defineProps({
    replyTo: { type: Object, required: true },
    dismissible: { type: Boolean, default: false },
});

defineEmits(['dismiss']);

const { get } = useUsers();
</script>

<template>
    <div class="cv-reply-preview flex items-start justify-between gap-2 rounded border-l-4 border-converse-accent bg-converse-overlay/5 px-2 py-1">
        <div class="cv-reply-preview__text min-w-0">
            <p class="text-xs font-medium text-converse-accent">{{ get({ type: replyTo.chatable_type, id: replyTo.chatable_id }).name }}</p>
            <p class="truncate text-xs text-converse-textMuted">{{ replyTo.body }}</p>
        </div>
        <button v-if="dismissible" type="button" class="text-converse-textMuted hover:text-converse-text" @click="$emit('dismiss')">×</button>
    </div>
</template>
