<script setup lang="ts">
import { LuEye, LuEyeOff, LuX } from 'vue-icons-plus/lu'
import { computed, mergeProps, nextTick, ref, useAttrs, watch } from 'vue'

import { oInputProps, type OInputEmits, type OInputSlots } from './input'

defineOptions({
  name: 'OInput',
  inheritAttrs: false,
})

const props = defineProps(oInputProps)
const emit = defineEmits<OInputEmits>()
const attrs = useAttrs()

defineSlots<OInputSlots>()

const inputElement = ref<HTMLInputElement>()
const isComposing = ref(false)
const isPasswordVisible = ref(false)

const canClear = computed(
  () => props.clearable && props.modelValue.length > 0 && !props.disabled && !props.readonly,
)
const canTogglePassword = computed(() => props.type === 'password' && props.showPassword)
const resolvedType = computed(() =>
  canTogglePassword.value && isPasswordVisible.value ? 'text' : props.type,
)
const passwordToggleLabel = computed(() =>
  isPasswordVisible.value ? props.hidePasswordAriaLabel : props.showPasswordAriaLabel,
)

watch(
  () => props.type,
  (type) => {
    if (type !== 'password') isPasswordVisible.value = false
  },
)

const restoreControlledValue = (): void => {
  const element = inputElement.value
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

  void commitValue((event.target as HTMLInputElement).value)
}

const handleCompositionStart = (): void => {
  if (!props.disabled && !props.readonly) isComposing.value = true
}

const handleCompositionEnd = (event: CompositionEvent): void => {
  if (!isComposing.value) return

  const value = (event.target as HTMLInputElement).value
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

const handleClear = (): void => {
  if (!canClear.value) return

  emit('clear')
  void commitValue('').then(() => inputElement.value?.focus())
}

const togglePasswordVisibility = (): void => {
  if (!canTogglePassword.value || props.disabled) return

  isPasswordVisible.value = !isPasswordVisible.value
}

const getFieldAttrs = () =>
  mergeProps(
    {
      class: 'o-input__field',
      onInput: handleInput,
      onCompositionstart: handleCompositionStart,
      onCompositionend: handleCompositionEnd,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    attrs,
    {
      'aria-label': props.ariaLabel ?? attrs['aria-label'],
      'aria-invalid': props.invalid ? 'true' : attrs['aria-invalid'],
    },
  )
</script>

<template>
  <span
    class="o-input"
    :class="[
      `o-input--${props.size}`,
      `o-input--${props.variant}`,
      {
        'is-disabled': props.disabled,
        'is-readonly': props.readonly,
        'is-invalid': props.invalid,
      },
    ]"
  >
    <span class="o-input__control">
      <span v-if="$slots.prefix" class="o-input__prefix">
        <slot name="prefix" />
      </span>

      <input
        v-bind="getFieldAttrs()"
        ref="inputElement"
        :value="props.modelValue"
        :type="resolvedType"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :readonly="props.readonly"
      />

      <span v-if="$slots.suffix" class="o-input__suffix">
        <slot name="suffix" />
      </span>

      <button
        v-if="canClear"
        class="o-input__action o-input__clear"
        type="button"
        :aria-label="props.clearAriaLabel"
        @click="handleClear"
      >
        <LuX aria-hidden="true" />
      </button>

      <button
        v-if="canTogglePassword"
        class="o-input__action o-input__password-toggle"
        type="button"
        :disabled="props.disabled"
        :aria-label="passwordToggleLabel"
        :aria-pressed="isPasswordVisible"
        @click="togglePasswordVisibility"
      >
        <LuEyeOff v-if="isPasswordVisible" aria-hidden="true" />
        <LuEye v-else aria-hidden="true" />
      </button>
    </span>
  </span>
</template>
