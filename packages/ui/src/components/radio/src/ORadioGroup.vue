<script setup lang="ts">
import { computed, nextTick, provide, useId } from 'vue'

import { oRadioGroupKey } from './radio-context'
import { oRadioGroupProps, type ORadioGroupEmits, type ORadioGroupSlots } from './radio'

defineOptions({
  name: 'ORadioGroup',
  inheritAttrs: false,
})

const props = defineProps(oRadioGroupProps)
const emit = defineEmits<ORadioGroupEmits>()

defineSlots<ORadioGroupSlots>()

const generatedName = `o-radio-group-${useId()}`
const resolvedName = computed(() => props.name?.trim() || generatedName)
const restoreCallbacks = new Set<() => void>()

const registerRestore = (restore: () => void): (() => void) => {
  restoreCallbacks.add(restore)
  return () => restoreCallbacks.delete(restore)
}

const select = (value: string | number, event: Event): void => {
  if (props.disabled) return

  emit('update:modelValue', value)
  emit('change', value, event)
  void nextTick(() => {
    for (const restore of restoreCallbacks) restore()
  })
}

provide(oRadioGroupKey, {
  modelValue: computed(() => props.modelValue),
  name: resolvedName,
  disabled: computed(() => props.disabled),
  invalid: computed(() => props.invalid),
  select,
  registerRestore,
})
</script>

<template>
  <div
    v-bind="$attrs"
    class="o-radio-group"
    :class="[`o-radio-group--${props.orientation}`, { 'is-disabled': props.disabled }]"
    role="radiogroup"
    :aria-label="props.ariaLabel"
    :aria-orientation="props.orientation"
    :aria-invalid="props.invalid || undefined"
  >
    <slot />
  </div>
</template>
