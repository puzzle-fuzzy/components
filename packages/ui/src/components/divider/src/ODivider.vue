<script setup lang="ts">
import { computed } from 'vue'

import { oDividerProps, type ODividerSlots } from './divider'

defineOptions({
  name: 'ODivider',
})

const props = defineProps(oDividerProps)
const slots = defineSlots<ODividerSlots>()

const hasContent = computed(() => props.direction === 'horizontal' && Boolean(slots.default))
</script>

<template>
  <div
    class="o-divider"
    :class="[
      `o-divider--${props.direction}`,
      `o-divider--content-${props.contentPosition}`,
      {
        'o-divider--dashed': props.dashed,
        'o-divider--with-content': hasContent,
      },
    ]"
    role="separator"
    :aria-orientation="props.direction"
  >
    <span v-if="hasContent" class="o-divider__line" aria-hidden="true" />
    <span v-if="hasContent" class="o-divider__content"><slot /></span>
    <span class="o-divider__line" aria-hidden="true" />
  </div>
</template>
