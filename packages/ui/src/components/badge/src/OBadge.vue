<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { formatOBadgeValue, normalizeOBadgeMax, oBadgeProps, type OBadgeSlots } from './badge'

defineOptions({ name: 'OBadge' })

const props = defineProps(oBadgeProps)

defineSlots<OBadgeSlots>()

const slots = useSlots()
const hasContent = computed(() => Boolean(slots.default))
const visible = computed(() => {
  if (props.hidden) return false
  if (props.dot) return true
  if (props.value === undefined) return false

  return props.showZero || props.value !== 0
})
const normalizedMax = computed(() => normalizeOBadgeMax(props.max))
const markerText = computed(() =>
  props.value === undefined ? '' : formatOBadgeValue(props.value, normalizedMax.value),
)
</script>

<template>
  <span
    class="o-badge"
    :class="[{ 'o-badge--with-content': hasContent }, `o-badge--${props.tone}`]"
  >
    <slot />
    <sup
      v-if="visible"
      class="o-badge__marker"
      :class="{ 'o-badge__marker--dot': props.dot }"
      :role="props.ariaLabel ? 'img' : undefined"
      :aria-label="props.ariaLabel"
      :aria-hidden="props.dot && !props.ariaLabel ? 'true' : undefined"
    >
      {{ props.dot ? '' : markerText }}
    </sup>
  </span>
</template>
