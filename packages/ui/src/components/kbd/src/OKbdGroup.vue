<script setup lang="ts">
import { oKbdGroupProps, type OKbdGroupSlots } from './kbd'

defineOptions({ name: 'OKbdGroup' })

const props = defineProps(oKbdGroupProps)

defineSlots<OKbdGroupSlots>()
</script>

<template>
  <span
    class="o-kbd-group"
    data-slot="kbd-group"
    role="group"
    :aria-label="props.ariaLabel || undefined"
  >
    <slot />
  </span>
</template>
