<script setup lang="ts">
import { computed, useId, type CSSProperties } from 'vue'

import {
  normalizeOProgressValue,
  oProgressProps,
  type OProgressLabelSlotProps,
  type OProgressSlots,
} from './progress'

defineOptions({ name: 'OProgress' })

const props = defineProps(oProgressProps)
const slots = defineSlots<OProgressSlots>()

const labelId = `o-progress-${useId()}-label`
const normalizedValue = computed(() => normalizeOProgressValue(props.value))
const indeterminate = computed(() => normalizedValue.value === undefined)
const visibleLabel = computed(() => {
  if (props.label !== undefined) return props.label
  if (normalizedValue.value === undefined) return ''

  return `${String(Math.round(normalizedValue.value))}%`
})
const labelSlotProps = computed<OProgressLabelSlotProps>(() => ({
  value: normalizedValue.value,
  indeterminate: indeterminate.value,
  status: props.status,
}))
const usesRenderedLabel = computed(
  () =>
    props.showLabel &&
    slots.label === undefined &&
    props.ariaLabel === undefined &&
    props.label === undefined &&
    normalizedValue.value !== undefined,
)
const resolvedAriaLabel = computed(() => {
  if (props.ariaLabel !== undefined) return props.ariaLabel
  if (props.label !== undefined) return props.label
  if (usesRenderedLabel.value) return undefined

  return 'Progress'
})
const labelledBy = computed(() => (usesRenderedLabel.value ? labelId : undefined))
const fillStyle = computed<CSSProperties & Partial<Record<'--o-progress-value', number>>>(() => {
  if (normalizedValue.value === undefined) return {}

  return { '--o-progress-value': normalizedValue.value / 100 }
})

if (import.meta.env.DEV && slots.label && props.ariaLabel === undefined) {
  console.warn('[OMG UI][OProgress] Provide ariaLabel when using the label slot.')
}
</script>

<template>
  <div
    class="o-progress"
    :class="[
      `o-progress--${props.status}`,
      `o-progress--${props.size}`,
      { 'o-progress--indeterminate': indeterminate },
    ]"
    role="progressbar"
    :aria-label="resolvedAriaLabel"
    :aria-labelledby="labelledBy"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="indeterminate ? undefined : normalizedValue"
  >
    <div class="o-progress__track" aria-hidden="true">
      <span class="o-progress__fill" :style="fillStyle" />
    </div>

    <span
      v-if="props.showLabel"
      :id="usesRenderedLabel ? labelId : undefined"
      class="o-progress__label"
    >
      <slot name="label" v-bind="labelSlotProps">{{ visibleLabel }}</slot>
    </span>
  </div>
</template>
