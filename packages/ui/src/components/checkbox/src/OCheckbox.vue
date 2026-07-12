<script setup lang="ts">
import { LuCheck, LuMinus } from 'vue-icons-plus/lu'
import { computed, mergeProps, nextTick, onMounted, ref, useAttrs, useId, watch } from 'vue'

import { oCheckboxProps, type OCheckboxEmits, type OCheckboxSlots } from './checkbox'

defineOptions({
  name: 'OCheckbox',
  inheritAttrs: false,
})

const props = defineProps(oCheckboxProps)
const emit = defineEmits<OCheckboxEmits>()
const attrs = useAttrs()

defineSlots<OCheckboxSlots>()

const inputElement = ref<HTMLInputElement>()
const generatedId = `o-checkbox-${useId()}`
const fieldId = computed(() =>
  typeof attrs.id === 'string' && attrs.id.trim().length > 0 ? attrs.id : generatedId,
)

const syncNativeState = (): void => {
  const element = inputElement.value
  if (!element) return

  element.checked = props.modelValue
  element.indeterminate = props.indeterminate
}

const handleClick = (event: MouseEvent): void => {
  if (!props.readonly) return

  event.preventDefault()
  void nextTick(syncNativeState)
}

const handleChange = async (event: Event): Promise<void> => {
  if (props.disabled || props.readonly) {
    syncNativeState()
    return
  }

  const value = (event.target as HTMLInputElement).checked
  emit('update:modelValue', value)
  emit('change', value, event)
  await nextTick()
  syncNativeState()
}

const getInputAttrs = () =>
  mergeProps(
    {
      class: 'o-checkbox__input',
      onClick: handleClick,
      onChange: handleChange,
    },
    attrs,
    {
      id: fieldId.value,
      'aria-checked': props.indeterminate ? 'mixed' : String(props.modelValue),
      'aria-readonly': props.readonly ? 'true' : attrs['aria-readonly'],
      'aria-invalid': props.invalid ? 'true' : attrs['aria-invalid'],
    },
  )

onMounted(syncNativeState)
watch(() => [props.modelValue, props.indeterminate], syncNativeState, { flush: 'post' })
</script>

<template>
  <span
    class="o-checkbox"
    :class="{
      'is-checked': props.modelValue && !props.indeterminate,
      'is-indeterminate': props.indeterminate,
      'is-disabled': props.disabled,
      'is-readonly': props.readonly,
      'is-invalid': props.invalid,
    }"
  >
    <input
      v-bind="getInputAttrs()"
      ref="inputElement"
      type="checkbox"
      :checked="props.modelValue"
      :disabled="props.disabled"
    />
    <label class="o-checkbox__label" :for="fieldId">
      <span class="o-checkbox__indicator" aria-hidden="true">
        <LuMinus v-if="props.indeterminate" />
        <LuCheck v-else-if="props.modelValue" />
      </span>
      <span v-if="$slots.default || props.label" class="o-checkbox__text">
        <slot>{{ props.label }}</slot>
      </span>
    </label>
  </span>
</template>
