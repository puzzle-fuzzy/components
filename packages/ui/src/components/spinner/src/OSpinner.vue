<script setup lang="ts">
import { LuLoader2 } from 'vue-icons-plus/lu'

import { oSpinnerProps } from './spinner'

defineOptions({ name: 'OSpinner' })

const props = defineProps(oSpinnerProps)
</script>

<template>
  <span
    class="o-spinner"
    :class="`o-spinner--${props.size}`"
    data-slot="spinner"
    :role="props.decorative ? undefined : 'status'"
    :aria-label="props.decorative ? undefined : props.label"
    :aria-hidden="props.decorative ? 'true' : undefined"
  >
    <LuLoader2 class="o-spinner__icon" aria-hidden="true" focusable="false" />
  </span>
</template>
