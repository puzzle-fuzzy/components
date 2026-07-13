<script setup lang="ts">
import { PopoverTrigger } from 'reka-ui'
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  shallowRef,
  watchPostEffect,
  type ComponentPublicInstance,
} from 'vue'

import { resolvePopoverElement, useOPopoverContext } from './popover-context'
import { oPopoverTriggerProps, type OPopoverTriggerSlots } from './popover'

defineOptions({
  name: 'OPopoverTrigger',
  inheritAttrs: false,
})

const props = defineProps(oPopoverTriggerProps)

defineSlots<OPopoverTriggerSlots>()

const context = useOPopoverContext('OPopoverTrigger')
const primitive = shallowRef<Element | ComponentPublicInstance | null>(null)

const registerElement = (): void => {
  const element = resolvePopoverElement(primitive.value)
  if (element) {
    element.id = context.triggerId
    element.setAttribute('aria-controls', context.contentId)
  }
  context.setTriggerElement(element)
}

watchPostEffect(registerElement)
onMounted(() => void nextTick(registerElement))
onUpdated(registerElement)
onBeforeUnmount(() => context.setTriggerElement(null))
</script>

<template>
  <PopoverTrigger
    :id="context.triggerId"
    v-bind="$attrs"
    ref="primitive"
    data-slot="popover-trigger"
    :aria-controls="context.contentId"
    :as="props.as"
    :as-child="props.asChild"
  >
    <slot />
  </PopoverTrigger>
</template>
