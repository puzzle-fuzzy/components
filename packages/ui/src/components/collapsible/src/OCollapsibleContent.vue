<script setup lang="ts">
import { CollapsibleContent } from 'reka-ui'
import { inject } from 'vue'

import {
  oCollapsibleContentProps,
  oCollapsibleContextKey,
  type OCollapsibleContentSlots,
} from './collapsible'

defineOptions({
  name: 'OCollapsibleContent',
  inheritAttrs: false,
})

const props = defineProps(oCollapsibleContentProps)

defineSlots<OCollapsibleContentSlots>()

const context = inject(oCollapsibleContextKey, undefined)
</script>

<template>
  <CollapsibleContent
    v-bind="$attrs"
    class="o-collapsible__content"
    data-slot="collapsible-content"
    :style="{
      '--omg-collapsible-content-height': 'var(--reka-collapsible-content-height)',
    }"
    :force-mount="props.forceMount"
    :as="props.as"
    :as-child="props.asChild"
  >
    <div
      :id="context?.contentId"
      class="o-collapsible__content-inner"
      :data-state="context?.open.value ? 'open' : 'closed'"
    >
      <slot />
    </div>
  </CollapsibleContent>
</template>
