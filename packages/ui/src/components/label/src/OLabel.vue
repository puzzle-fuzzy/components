<script setup lang="ts">
import { oLabelProps, type OLabelSlots } from './label'

defineOptions({
  name: 'OLabel',
  inheritAttrs: false,
})

const props = defineProps(oLabelProps)

defineSlots<OLabelSlots>()
</script>

<template>
  <label
    v-bind="$attrs"
    class="o-label"
    data-slot="label"
    :for="props.for"
    :data-disabled="props.disabled ? 'true' : undefined"
    :data-required="props.required ? 'true' : undefined"
  >
    <slot />
    <span
      v-if="props.required"
      class="o-label__required"
      data-slot="label-required"
      aria-hidden="true"
      >*</span
    >
  </label>
</template>
