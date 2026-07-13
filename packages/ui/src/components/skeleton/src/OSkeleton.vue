<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

import {
  normalizeOSkeletonDimension,
  normalizeOSkeletonLines,
  oSkeletonProps,
  type OSkeletonSlots,
} from './skeleton'

defineOptions({
  name: 'OSkeleton',
  inheritAttrs: false,
})

const props = defineProps(oSkeletonProps)

defineSlots<OSkeletonSlots>()

type OSkeletonStyle = CSSProperties &
  Partial<Record<'--omg-skeleton-height' | '--omg-skeleton-width', string>>

const lineCount = computed(() =>
  props.variant === 'text' ? normalizeOSkeletonLines(props.lines) : 1,
)
const skeletonStyle = computed<OSkeletonStyle>(() => {
  const style: OSkeletonStyle = {}
  const height = normalizeOSkeletonDimension(props.height)
  const width = normalizeOSkeletonDimension(props.width)

  if (height) style['--omg-skeleton-height'] = height
  if (width) style['--omg-skeleton-width'] = width

  return style
})
</script>

<template>
  <div
    v-if="props.loading"
    v-bind="$attrs"
    class="o-skeleton"
    :class="[`o-skeleton--${props.variant}`, { 'o-skeleton--animated': props.animated }]"
    :style="skeletonStyle"
    aria-hidden="true"
  >
    <span
      v-for="line in lineCount"
      :key="line"
      class="o-skeleton__shape"
      :class="{ 'o-skeleton__shape--last': props.variant === 'text' && line === lineCount }"
      aria-hidden="true"
    />
  </div>
  <slot v-else />
</template>
