<script setup lang="ts">
import { computed } from 'vue'

import { oTextareaProps, type OTextareaEmits } from './textarea'

defineOptions({ name: 'OTextarea' })

const props = defineProps(oTextareaProps)
const emit = defineEmits<OTextareaEmits>()

const countText = computed(() =>
  props.maxlength === undefined
    ? String(props.modelValue.length)
    : `${String(props.modelValue.length)}/${String(props.maxlength)}`,
)

const handleInput = (event: Event): void => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div
    class="o-textarea"
    :class="[
      `o-textarea--${props.resize}`,
      {
        'is-disabled': props.disabled,
        'is-readonly': props.readonly,
        'is-invalid': props.invalid,
      },
    ]"
  >
    <textarea
      class="o-textarea__field"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :rows="props.rows"
      :maxlength="props.maxlength"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :aria-label="props.ariaLabel"
      :aria-invalid="props.invalid || undefined"
      @input="handleInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <span v-if="props.showCount" class="o-textarea__count">{{ countText }}</span>
  </div>
</template>
