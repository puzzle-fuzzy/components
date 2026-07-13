<script setup lang="ts">
import { oInputGroupProps, type OInputGroupSlots } from './input-group'

defineOptions({
  name: 'OInputGroup',
  inheritAttrs: false,
})

const props = defineProps(oInputGroupProps)

defineSlots<OInputGroupSlots>()
</script>

<template>
  <div
    v-bind="$attrs"
    class="o-input-group"
    role="group"
    data-slot="input-group"
    :data-invalid="props.invalid ? 'true' : undefined"
    :data-disabled="props.disabled ? 'true' : undefined"
    :aria-label="props.ariaLabel"
  >
    <slot />
  </div>
</template>
