<script setup lang="ts">
import { computed, provide } from 'vue'

import { oButtonGroupContextKey, oButtonGroupProps, type OButtonGroupSlots } from './button-group'

defineOptions({
  name: 'OButtonGroup',
  inheritAttrs: false,
})

const props = defineProps(oButtonGroupProps)

defineSlots<OButtonGroupSlots>()

provide(oButtonGroupContextKey, {
  orientation: computed(() => props.orientation),
})
</script>

<template>
  <div
    v-bind="$attrs"
    class="o-button-group"
    role="group"
    data-slot="button-group"
    :data-orientation="props.orientation"
    :data-attached="String(props.attached)"
    :aria-label="props.ariaLabel"
  >
    <slot />
  </div>
</template>
