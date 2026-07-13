<script setup lang="ts">
import { PopoverAnchor } from 'reka-ui'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  shallowRef,
  watchPostEffect,
  type ComponentPublicInstance,
} from 'vue'

import { resolvePopoverElement, useOPopoverContext } from './popover-context'
import { oPopoverAnchorProps, type OPopoverAnchorSlots } from './popover'

defineOptions({
  name: 'OPopoverAnchor',
  inheritAttrs: false,
})

const props = defineProps(oPopoverAnchorProps)

defineSlots<OPopoverAnchorSlots>()

const context = useOPopoverContext('OPopoverAnchor')
const primitive = shallowRef<Element | ComponentPublicInstance | null>(null)
const internalReference = computed(() => props.reference as never)

const registerElement = (): void => {
  const reference = props.reference
  const referenceElement =
    reference && 'contextElement' in reference
      ? reference.contextElement
      : typeof HTMLElement !== 'undefined' && reference instanceof HTMLElement
        ? reference
        : undefined
  context.setAnchorElement(referenceElement ?? resolvePopoverElement(primitive.value))
}

watchPostEffect(registerElement)
onMounted(() => void nextTick(registerElement))
onUpdated(registerElement)
onBeforeUnmount(() => context.setAnchorElement(null))
</script>

<template>
  <PopoverAnchor
    v-bind="$attrs"
    ref="primitive"
    data-slot="popover-anchor"
    :as="props.as"
    :as-child="props.asChild"
    :reference="internalReference"
  >
    <slot />
  </PopoverAnchor>
</template>
