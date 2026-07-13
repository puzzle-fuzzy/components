<script setup lang="ts">
import { inject } from 'vue'

import { oFieldContextKey } from './field-context'
import type { OFieldDescriptionSlots } from './field'

defineOptions({
  name: 'OFieldDescription',
  inheritAttrs: false,
})

defineSlots<OFieldDescriptionSlots>()

const field = inject(oFieldContextKey, undefined)
</script>

<template>
  <p
    v-bind="$attrs"
    class="o-field__description"
    data-slot="field-description"
    :data-disabled="field?.disabled.value ? 'true' : undefined"
    :data-invalid="field?.invalid.value ? 'true' : undefined"
  >
    <slot />
  </p>
</template>
