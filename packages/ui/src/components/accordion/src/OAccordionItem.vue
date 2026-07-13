<script setup lang="ts">
import { AccordionItem } from 'reka-ui'
import { provide, useId } from 'vue'

import {
  oAccordionItemContextKey,
  oAccordionItemProps,
  type OAccordionItemSlots,
} from './accordion'

defineOptions({
  name: 'OAccordionItem',
  inheritAttrs: false,
})

const props = defineProps(oAccordionItemProps)

defineSlots<OAccordionItemSlots>()

provide(oAccordionItemContextKey, {
  contentId: `o-accordion-${useId()}-content`,
})
</script>

<template>
  <AccordionItem
    v-slot="slotProps"
    v-bind="$attrs"
    class="o-accordion__item"
    data-slot="accordion-item"
    :data-value="props.value"
    :value="props.value"
    :disabled="props.disabled"
    :as="props.as"
    :as-child="props.asChild"
  >
    <slot :open="slotProps.open" />
  </AccordionItem>
</template>
