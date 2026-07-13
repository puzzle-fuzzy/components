<script setup lang="ts">
import type { OFieldGroupSlots } from './field'

defineOptions({
  name: 'OFieldGroup',
  inheritAttrs: false,
})

defineSlots<OFieldGroupSlots>()
</script>

<template>
  <div v-bind="$attrs" class="o-field-group" data-slot="field-group">
    <slot />
  </div>
</template>
