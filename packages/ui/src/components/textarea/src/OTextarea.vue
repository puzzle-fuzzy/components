<script setup lang="ts">
import { computed, mergeProps, nextTick, ref, useAttrs, useId } from 'vue'

import { oTextareaProps, type OTextareaEmits } from './textarea'

defineOptions({
  name: 'OTextarea',
  inheritAttrs: false,
})

const props = defineProps(oTextareaProps)
const emit = defineEmits<OTextareaEmits>()
const attrs = useAttrs()
const textareaElement = ref<HTMLTextAreaElement>()
const isComposing = ref(false)
const countId = useId()

const countText = computed(() =>
  props.maxlength === undefined
    ? String(props.modelValue.length)
    : `${String(props.modelValue.length)}/${String(props.maxlength)}`,
)

const mergeAriaDescribedBy = (externalValue: unknown): string | undefined => {
  const externalIds =
    typeof externalValue === 'string' ? externalValue.trim().split(/\s+/u).filter(Boolean) : []
  const ids = props.showCount ? [...externalIds, countId] : externalIds
  const uniqueIds = [...new Set(ids)]

  return uniqueIds.length > 0 ? uniqueIds.join(' ') : undefined
}

const restoreControlledValue = (): void => {
  const element = textareaElement.value
  if (element && element.value !== props.modelValue) {
    element.value = props.modelValue
  }
}

const commitValue = async (value: string): Promise<void> => {
  emit('update:modelValue', value)
  await nextTick()
  restoreControlledValue()
}

const handleInput = (event: Event): void => {
  const inputEvent = event as InputEvent
  if (props.disabled || props.readonly) {
    restoreControlledValue()
    return
  }
  if (isComposing.value || inputEvent.isComposing) return

  void commitValue((event.target as HTMLTextAreaElement).value)
}

const handleCompositionStart = (): void => {
  if (!props.disabled && !props.readonly) {
    isComposing.value = true
  }
}

const handleCompositionEnd = (event: CompositionEvent): void => {
  if (!isComposing.value) return

  const value = (event.target as HTMLTextAreaElement).value
  void nextTick(() => {
    isComposing.value = false
    void commitValue(value)
  })
}

const handleFocus = (event: FocusEvent): void => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent): void => {
  emit('blur', event)
}

const getFieldAttrs = () =>
  mergeProps(
    {
      class: 'o-textarea__field',
      onInput: handleInput,
      onCompositionstart: handleCompositionStart,
      onCompositionend: handleCompositionEnd,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    attrs,
    {
      'aria-invalid': props.invalid ? 'true' : attrs['aria-invalid'],
      'aria-describedby': mergeAriaDescribedBy(attrs['aria-describedby']),
    },
  )
</script>

<template>
  <div
    class="o-textarea"
    :class="[
      `o-textarea--${props.resize}`,
      {
        'is-count-visible': props.showCount,
        'is-disabled': props.disabled,
        'is-readonly': props.readonly,
        'is-invalid': props.invalid,
      },
    ]"
  >
    <div class="o-textarea__control">
      <textarea
        v-bind="getFieldAttrs()"
        ref="textareaElement"
        :value="props.modelValue"
        :placeholder="props.placeholder"
        :rows="props.rows"
        :maxlength="props.maxlength"
        :disabled="props.disabled"
        :readonly="props.readonly"
        :aria-label="props.ariaLabel"
      />
      <span v-if="props.showCount" :id="countId" class="o-textarea__count">
        {{ countText }}
      </span>
    </div>
  </div>
</template>
