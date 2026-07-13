<script setup lang="ts">
import { AccordionRoot } from 'reka-ui'
import { computed, useAttrs, watchEffect } from 'vue'

import {
  oAccordionProps,
  type OAccordionEmits,
  type OAccordionDirection,
  type OAccordionSlots,
  type OAccordionValue,
} from './accordion'

defineOptions({
  name: 'OAccordion',
  inheritAttrs: false,
})

const props = defineProps(oAccordionProps)
const emit = defineEmits<OAccordionEmits>()
const attrs = useAttrs()

defineSlots<OAccordionSlots>()

const normalizeValue = (value: unknown): OAccordionValue => {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) return value
  return undefined
}

const handleValueUpdate = (value: unknown): void => emit('update:modelValue', normalizeValue(value))

const optionalRootProps = computed(() => {
  const result: {
    dir?: OAccordionDirection
    modelValue?: string | string[]
    defaultValue?: string | string[]
  } = {}

  if (props.dir !== undefined) result.dir = props.dir
  if (props.modelValue !== undefined) result.modelValue = props.modelValue
  if (props.defaultValue !== undefined) result.defaultValue = props.defaultValue
  return result
})

const rootBindings = computed(() => ({ ...attrs, ...optionalRootProps.value }))

watchEffect(() => {
  if (!import.meta.env.DEV) return

  const values = [props.modelValue, props.defaultValue]
  if (props.type === 'single' && values.some(Array.isArray)) {
    console.warn(
      '[OMG UI][OAccordion] type="single" expects modelValue and defaultValue to be strings.',
    )
  }
  if (props.type === 'multiple' && values.some((value) => typeof value === 'string')) {
    console.warn(
      '[OMG UI][OAccordion] type="multiple" expects modelValue and defaultValue to be string arrays.',
    )
  }
})
</script>

<template>
  <AccordionRoot
    v-slot="slotProps"
    v-bind="rootBindings"
    class="o-accordion"
    data-slot="accordion"
    :data-orientation="props.orientation"
    :type="props.type"
    :collapsible="props.collapsible"
    :disabled="props.disabled"
    :orientation="props.orientation"
    :unmount-on-hide="props.unmountOnHide"
    :as="props.as"
    :as-child="props.asChild"
    @update:model-value="handleValueUpdate"
  >
    <slot :model-value="normalizeValue(slotProps.modelValue)" />
  </AccordionRoot>
</template>
