<script setup lang="ts">
import { inject } from 'vue'

import { oFieldContextKey } from './field-context'
import type { OFieldTitleSlots } from './field'

defineOptions({
  name: 'OFieldTitle',
  inheritAttrs: false,
})

defineSlots<OFieldTitleSlots>()

const field = inject(oFieldContextKey, undefined)
</script>

<template>
  <div
    v-bind="$attrs"
    class="o-field__title"
    data-slot="field-title"
    :data-disabled="field?.disabled.value ? 'true' : undefined"
  >
    <slot />
  </div>
</template>
