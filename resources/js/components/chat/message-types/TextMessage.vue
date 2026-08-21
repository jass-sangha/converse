<script setup>
import { computed } from "vue";
import LinkPreviewCard from "../LinkPreviewCard.vue";

const props = defineProps({
    message: { type: Object, required: true },
    isOwn: { type: Boolean, default: false },
});

const URL_PATTERN = /(https?:\/\/\S+)/g;

// Rendered as alternating text/link segments (not v-html) so the auto-linked URL still goes
// through Vue's normal escaping — message.body is untrusted user content.
const segments = computed(() => {
    const body = props.message.body ?? "";
    return body
        .split(URL_PATTERN)
        .map((part, index) => ({
            key: index,
            text: part,
            isLink: index % 2 === 1,
        }))
        .filter((segment) => segment.text.length > 0);
});
</script>

<template>
    <div class="chat-text-message">
        <LinkPreviewCard
            v-if="message.metadata?.link_preview"
            :preview="message.metadata.link_preview"
            :is-own="isOwn"
        />
        <p
            class="chat-text-message__body whitespace-pre-wrap break-words text-sm"
        >
            <template v-for="segment in segments" :key="segment.key">
                <a
                    v-if="segment.isLink"
                    :href="segment.text"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline hover:no-underline"
                    @click.stop
                    >{{ segment.text }}</a
                >
                <template v-else>{{ segment.text }}</template>
            </template>
        </p>
    </div>
</template>
