<script setup lang="ts">
import { AccordionHeader, AccordionTrigger } from 'reka-ui'
import { inject } from 'vue'
import { LuChevronDown } from 'vue-icons-plus/lu'

import {
  oAccordionItemContextKey,
  oAccordionTriggerProps,
  type OAccordionTriggerSlots,
} from './accordion'

defineOptions({
  name: 'OAccordionTrigger',
  inheritAttrs: false,
})

const props = defineProps(oAccordionTriggerProps)

defineSlots<OAccordionTriggerSlots>()

const itemContext = inject(oAccordionItemContextKey, undefined)
</script>

<template>
  <AccordionHeader class="o-accordion__header">
    <AccordionTrigger
      v-bind="$attrs"
      class="o-accordion__trigger"
      data-slot="accordion-trigger"
      :aria-controls="itemContext?.contentId"
      :as="props.as"
      :as-child="props.asChild"
    >
      <slot />
      <span v-if="!props.asChild" class="o-accordion__indicator" aria-hidden="true">
        <slot name="icon">
          <LuChevronDown />
        </slot>
      </span>
    </AccordionTrigger>
  </AccordionHeader>
</template>
