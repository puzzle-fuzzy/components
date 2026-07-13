<script setup lang="ts">
import { oKbdProps, type OKbdSlots } from './kbd'

defineOptions({ name: 'OKbd' })

const props = defineProps(oKbdProps)

defineSlots<OKbdSlots>()
</script>

<template>
  <kbd class="o-kbd" :class="`o-kbd--${props.size}`" data-slot="kbd"><slot /></kbd>
</template>
