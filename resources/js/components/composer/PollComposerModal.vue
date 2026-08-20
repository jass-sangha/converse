<script setup>
import { computed, ref } from 'vue';
import Modal from '../shared/Modal.vue';
import Icon from '../shared/Icon.vue';

const emit = defineEmits(['close', 'create']);

const question = ref('');
const options = ref(['', '']);
const multiple = ref(false);
const submitting = ref(false);

const canAddOption = computed(() => options.value.length < 12);
const validOptions = computed(() => options.value.map((o) => o.trim()).filter(Boolean));
const canSubmit = computed(() => question.value.trim().length > 0 && validOptions.value.length >= 2);

function addOption() {
    if (canAddOption.value) options.value.push('');
}

function removeOption(index) {
    if (options.value.length > 2) options.value.splice(index, 1);
}

async function submit() {
    if (!canSubmit.value || submitting.value) return;

    submitting.value = true;
    try {
        emit('create', {
            question: question.value.trim(),
            options: validOptions.value,
            multiple: multiple.value,
        });
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <Modal title="Create poll" @close="emit('close')">
        <label class="mb-1 block text-xs font-medium uppercase text-riwaaq-textMuted">Question</label>
        <input
            v-model="question"
            type="text"
            maxlength="255"
            placeholder="Ask a question"
            class="mb-4 w-full border-b border-riwaaq-border bg-transparent pb-2 text-[15px] text-riwaaq-text focus:border-riwaaq-accent focus:outline-none"
        >

        <label class="mb-1 block text-xs font-medium uppercase text-riwaaq-textMuted">Options</label>
        <div class="flex flex-col gap-2">
            <div v-for="(option, index) in options" :key="index" class="flex items-center gap-2">
                <input
                    v-model="options[index]"
                    type="text"
                    maxlength="100"
                    :placeholder="`Option ${index + 1}`"
                    class="flex-1 rounded-chat border border-riwaaq-border bg-transparent px-3 py-1.5 text-sm text-riwaaq-text focus:border-riwaaq-accent focus:outline-none"
                >
                <button
                    v-if="options.length > 2"
                    type="button"
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-riwaaq-textMuted hover:bg-riwaaq-surfaceHover"
                    @click="removeOption(index)"
                >
                    <Icon name="close-alt" :size="16" />
                </button>
            </div>
        </div>

        <button
            v-if="canAddOption"
            type="button"
            class="mt-2 text-sm text-riwaaq-accent"
            @click="addOption"
        >
            + Add option
        </button>

        <label class="mt-4 flex items-center justify-between">
            <span class="text-sm text-riwaaq-text">Allow multiple answers</span>
            <button
                type="button"
                class="relative h-[27px] w-[46px] shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-riwaaq-accent focus-visible:ring-offset-2 focus-visible:ring-offset-riwaaq-surface"
                :class="multiple ? 'bg-riwaaq-sage' : 'bg-riwaaq-border'"
                role="switch"
                :aria-checked="multiple"
                @click="multiple = !multiple"
            >
                <span
                    class="absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow transition-[left] duration-150 ease-out"
                    :class="multiple ? 'left-[22px]' : 'left-[3px]'"
                />
            </button>
        </label>

        <template #footer>
            <button
                type="button"
                class="w-full rounded bg-riwaaq-accent py-1.5 text-sm text-white disabled:opacity-50"
                :disabled="!canSubmit || submitting"
                @click="submit"
            >
                Create poll
            </button>
        </template>
    </Modal>
</template>
