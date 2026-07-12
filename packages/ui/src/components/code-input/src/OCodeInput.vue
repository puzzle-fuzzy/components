<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import {
  normalizeOCodeInputLength,
  oCodeInputProps,
  sanitizeOCodeInputValue,
  type OCodeInputEmits,
  type OCodeInputExpose,
} from './code-input'

defineOptions({ name: 'OCodeInput' })

const props = defineProps(oCodeInputProps)
const emit = defineEmits<OCodeInputEmits>()

const normalizedLength = computed(() => normalizeOCodeInputLength(props.length))
const normalizedValue = computed(() =>
  sanitizeOCodeInputValue(props.modelValue, normalizedLength.value),
)
const digits = computed(() =>
  Array.from({ length: normalizedLength.value }, (_, index) => normalizedValue.value[index] ?? ''),
)
const inputElements = ref<Array<HTMLInputElement | undefined>>([])

const normalizeFocusIndex = (index: number): number => {
  const integerIndex = Number.isFinite(index) ? Math.floor(index) : 0
  return Math.min(Math.max(0, integerIndex), normalizedLength.value - 1)
}

const focus = (index = 0): void => {
  const input = inputElements.value[normalizeFocusIndex(index)]
  input?.focus()
  input?.select()
}

defineExpose<OCodeInputExpose>({ focus })

const scheduleFocus = (index: number): void => {
  void nextTick(() => focus(index))
}

const setInputElement = (element: unknown, index: number): void => {
  inputElements.value[index] =
    typeof HTMLInputElement !== 'undefined' && element instanceof HTMLInputElement
      ? element
      : undefined
}

const commit = (value: string): void => {
  const normalized = sanitizeOCodeInputValue(value, normalizedLength.value)

  emit('update:modelValue', normalized)
  if (normalized.length === normalizedLength.value) {
    emit('complete', normalized)
  }
}

const restoreInputValue = (input: HTMLInputElement, index: number): void => {
  input.value = digits.value[index] ?? ''
}

const handleInput = (event: Event, index: number): void => {
  const input = event.target as HTMLInputElement

  if (props.disabled || props.readonly) {
    restoreInputValue(input, index)
    return
  }

  const digit = sanitizeOCodeInputValue(input.value, 1)
  const current = normalizedValue.value
  const targetIndex = Math.min(index, current.length)

  if (!digit) {
    if (targetIndex < current.length) {
      commit(current.slice(0, targetIndex) + current.slice(targetIndex + 1))
    } else {
      restoreInputValue(input, index)
    }
    return
  }

  const next = current.slice(0, targetIndex) + digit + current.slice(targetIndex + 1)
  commit(next)
  scheduleFocus(Math.min(targetIndex + 1, normalizedLength.value - 1))
}

const handleKeydown = (event: KeyboardEvent, index: number): void => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    focus(index - 1)
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    focus(index + 1)
    return
  }

  if (event.key !== 'Backspace' || props.disabled || props.readonly) return

  event.preventDefault()
  const current = normalizedValue.value
  if (!current) return

  const removalIndex = digits.value[index] ? index : Math.max(0, index - 1)
  commit(current.slice(0, removalIndex) + current.slice(removalIndex + 1))
  scheduleFocus(removalIndex)
}

const handlePaste = (event: ClipboardEvent, index: number): void => {
  if (props.disabled || props.readonly) return

  event.preventDefault()
  const pasted = sanitizeOCodeInputValue(
    event.clipboardData?.getData('text') ?? '',
    normalizedLength.value,
  )
  if (!pasted) return

  const current = normalizedValue.value
  const targetIndex = Math.min(index, current.length)
  const next = current.slice(0, targetIndex) + pasted + current.slice(targetIndex + pasted.length)
  const normalizedNext = sanitizeOCodeInputValue(next, normalizedLength.value)

  commit(normalizedNext)
  scheduleFocus(Math.min(normalizedNext.length, normalizedLength.value - 1))
}

const handleFocus = (event: FocusEvent): void => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent): void => {
  emit('blur', event)
}

onMounted(() => {
  if (props.autofocus) focus()
})
</script>

<template>
  <div
    class="o-code-input"
    :class="[
      `o-code-input--${props.size}`,
      {
        'is-disabled': props.disabled,
        'is-invalid': props.invalid,
        'is-readonly': props.readonly,
      },
    ]"
    role="group"
    :aria-label="props.ariaLabel"
  >
    <input
      v-for="(_, index) in digits"
      :key="index"
      :ref="(element) => setInputElement(element, index)"
      class="o-code-input__field"
      :value="digits[index]"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :aria-invalid="props.invalid || undefined"
      :aria-label="`${props.ariaLabel} ${index + 1}/${normalizedLength}`"
      @input="handleInput($event, index)"
      @keydown="handleKeydown($event, index)"
      @paste="handlePaste($event, index)"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>
