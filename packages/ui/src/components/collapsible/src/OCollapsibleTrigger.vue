<script setup lang="ts">
import { CollapsibleTrigger } from 'reka-ui'
import { inject } from 'vue'

import {
  oCollapsibleContextKey,
  oCollapsibleTriggerProps,
  type OCollapsibleTriggerSlots,
} from './collapsible'

defineOptions({
  name: 'OCollapsibleTrigger',
  inheritAttrs: false,
})

const props = defineProps(oCollapsibleTriggerProps)

defineSlots<OCollapsibleTriggerSlots>()

const context = inject(oCollapsibleContextKey, undefined)
</script>

<template>
  <CollapsibleTrigger
    v-bind="$attrs"
    class="o-collapsible__trigger"
    data-slot="collapsible-trigger"
    :aria-controls="context?.contentId"
    :as="props.as"
    :as-child="props.asChild"
  >
    <slot />
  </CollapsibleTrigger>
</template>
