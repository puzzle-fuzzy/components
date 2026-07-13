<script setup lang="ts">
import { oFieldLegendProps, type OFieldLegendSlots } from './field'

defineOptions({
  name: 'OFieldLegend',
  inheritAttrs: false,
})

const props = defineProps(oFieldLegendProps)

defineSlots<OFieldLegendSlots>()
</script>

<template>
  <legend
    v-bind="$attrs"
    class="o-field-legend"
    data-slot="field-legend"
    :data-variant="props.variant"
  >
    <slot />
  </legend>
</template>
