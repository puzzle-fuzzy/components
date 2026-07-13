<script setup lang="ts">
import { computed, inject } from 'vue'

import { oButtonGroupContextKey } from './button-group'

defineOptions({
  name: 'OButtonGroupSeparator',
  inheritAttrs: false,
})

const context = inject(oButtonGroupContextKey, undefined)
const orientation = computed(() => context?.orientation.value ?? 'horizontal')
const isGrouped = computed(() => context !== undefined)
</script>

<template>
  <span
    v-bind="$attrs"
    class="o-button-group__separator"
    data-slot="button-group-separator"
    :data-orientation="orientation"
    :data-grouped="String(isGrouped)"
    aria-hidden="true"
  />
</template>
