<script setup lang="ts">
import { computed, watch } from 'vue'

import {
  oReferenceTextareaProps,
  parseOReferenceTextareaReferences,
  type OReferenceTextareaEmits,
} from './reference-textarea'

defineOptions({ name: 'OReferenceTextarea' })

const props = defineProps(oReferenceTextareaProps)
const emit = defineEmits<OReferenceTextareaEmits>()

const references = computed(() => parseOReferenceTextareaReferences(props.modelValue))
const countText = computed(() =>
  props.maxlength === undefined
    ? String(props.modelValue.length)
    : `${String(props.modelValue.length)}/${String(props.maxlength)}`,
)

watch(
  references,
  (nextReferences) => {
    emit('referencesChange', nextReferences)
  },
  { immediate: true },
)

const handleInput = (event: Event): void => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div
    class="o-reference-textarea"
    :class="{
      'is-disabled': props.disabled,
      'is-readonly': props.readonly,
      'is-invalid': props.invalid,
      'is-referenced': references.length > 0,
    }"
  >
    <textarea
      class="o-reference-textarea__field"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :rows="props.rows"
      :maxlength="props.maxlength"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :aria-label="props.ariaLabel"
      :aria-invalid="props.invalid || undefined"
      @input="handleInput"
    />

    <span v-if="props.showCount" class="o-reference-textarea__count">{{ countText }}</span>

    <div v-if="references.length > 0" class="o-reference-textarea__references">
      <span
        v-for="reference in references"
        :key="reference.id"
        class="o-reference-textarea__reference"
        :class="`o-reference-textarea__reference--${reference.kind}`"
      >
        <span v-if="reference.kind === 'member'" class="o-reference-textarea__member">
          <span class="o-reference-textarea__member-symbol" aria-hidden="true">@</span>
          {{ reference.label }}
        </span>
        <span v-else class="o-reference-textarea__image">
          <img :src="reference.value" :alt="reference.label" />
          <span>{{ reference.label }}</span>
        </span>
      </span>
    </div>
  </div>
</template>
