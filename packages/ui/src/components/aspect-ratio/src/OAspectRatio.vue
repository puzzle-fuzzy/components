<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

import { normalizeOAspectRatio, oAspectRatioProps, type OAspectRatioSlots } from './aspect-ratio'

defineOptions({ name: 'OAspectRatio' })

const props = defineProps(oAspectRatioProps)

defineSlots<OAspectRatioSlots>()

type OAspectRatioStyle = CSSProperties & Partial<Record<'--omg-aspect-ratio', number>>

const aspectRatioStyle = computed<OAspectRatioStyle>(() => ({
  '--omg-aspect-ratio': normalizeOAspectRatio(props.ratio),
}))
</script>

<template>
  <div class="o-aspect-ratio" data-slot="aspect-ratio" :style="aspectRatioStyle">
    <slot />
  </div>
</template>
