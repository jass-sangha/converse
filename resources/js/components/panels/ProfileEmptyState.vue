<script setup>
import Icon from "../shared/Icon.vue";
</script>

<template>
    <div
        class="chat-profile-empty-state flex h-full flex-col items-center justify-center gap-3 bg-riwaaq-chatBg p-6 text-center"
    >
        <span
            class="flex h-16 w-16 items-center justify-center rounded-full bg-riwaaq-surface text-riwaaq-textMuted shadow-chat"
        >
            <Icon name="user" :size="28" />
        </span>
        <p class="text-sm text-riwaaq-textMuted">
            This is your profile. Manage your name, photo, and settings from the panel on the left.
        </p>
    </div>
</template>
