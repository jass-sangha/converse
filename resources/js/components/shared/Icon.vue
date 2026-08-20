<script setup>
import { computed } from 'vue';
import { getIcon } from '../../icons/registry';

const props = defineProps({
    name: { type: String, required: true },
    size: { type: [Number, String], default: 20 },
});

// Falls back to an empty glyph rather than throwing so a typo'd or
// not-yet-registered name degrades to invisible, not a crashed widget.
const icon = computed(() => getIcon(props.name) ?? { viewBox: '0 0 24 24', attrs: {}, inner: '' });
</script>

<template>
    <svg :viewBox="icon.viewBox" :width="size" :height="size" v-bind="icon.attrs" v-html="icon.inner" />
</template>
