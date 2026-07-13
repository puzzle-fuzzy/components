<script setup lang="ts">
import { inject } from 'vue'

import { oFieldContextKey } from './field-context'
import type { OFieldContentSlots } from './field'

defineOptions({
  name: 'OFieldContent',
  inheritAttrs: false,
})

defineSlots<OFieldContentSlots>()

const field = inject(oFieldContextKey, undefined)
</script>

<template>
  <div
    v-bind="$attrs"
    class="o-field__content"
    data-slot="field-content"
    :data-disabled="field?.disabled.value ? 'true' : undefined"
    :data-invalid="field?.invalid.value ? 'true' : undefined"
  >
    <slot />
  </div>
</template>
