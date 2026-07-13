<script setup lang="ts">
import { AccordionContent } from 'reka-ui'
import { inject } from 'vue'

import {
  oAccordionContentProps,
  oAccordionItemContextKey,
  type OAccordionContentSlots,
} from './accordion'

defineOptions({
  name: 'OAccordionContent',
  inheritAttrs: false,
})

const props = defineProps(oAccordionContentProps)

defineSlots<OAccordionContentSlots>()

const itemContext = inject(oAccordionItemContextKey, undefined)
</script>

<template>
  <AccordionContent
    v-bind="$attrs"
    class="o-accordion__content"
    data-slot="accordion-content"
    :style="{
      '--omg-accordion-content-height': 'var(--reka-accordion-content-height)',
      '--omg-accordion-content-width': 'var(--reka-accordion-content-width)',
    }"
    :force-mount="props.forceMount"
    :as="props.as"
    :as-child="props.asChild"
  >
    <div :id="itemContext?.contentId" class="o-accordion__content-inner">
      <slot />
    </div>
  </AccordionContent>
</template>
