<script setup lang="ts">
import { oInputGroupTextProps, type OInputGroupTextSlots } from './input-group'

defineOptions({
  name: 'OInputGroupText',
  inheritAttrs: false,
})

const props = defineProps(oInputGroupTextProps)

defineSlots<OInputGroupTextSlots>()
</script>

<template>
  <component
    :is="props.tag"
    v-bind="$attrs"
    class="o-input-group__text"
    data-slot="input-group-text"
  >
    <slot />
  </component>
</template>
