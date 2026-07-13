<script setup lang="ts">
import { oButtonGroupTextProps, type OButtonGroupTextSlots } from './button-group'

defineOptions({
  name: 'OButtonGroupText',
  inheritAttrs: false,
})

const props = defineProps(oButtonGroupTextProps)

defineSlots<OButtonGroupTextSlots>()
</script>

<template>
  <component
    :is="props.tag"
    v-bind="$attrs"
    class="o-button-group__text"
    data-slot="button-group-text"
  >
    <slot />
  </component>
</template>
