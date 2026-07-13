<script setup lang="ts">
import { PopoverContent, PopoverPortal } from 'reka-ui'
import {
  computed,
  mergeProps,
  nextTick,
  onMounted,
  onUpdated,
  shallowRef,
  useAttrs,
  watch,
  watchPostEffect,
  type ComponentPublicInstance,
} from 'vue'

import { syncFloatingContext } from '../../../composables/use-floating-context'
import { resolvePopoverElement, useOPopoverContext } from './popover-context'
import {
  oPopoverContentProps,
  type OPopoverContentEmits,
  type OPopoverContentSlots,
} from './popover'

defineOptions({
  name: 'OPopoverContent',
  inheritAttrs: false,
})

const props = defineProps(oPopoverContentProps)
const emit = defineEmits<OPopoverContentEmits>()
const attrs = useAttrs()

defineSlots<OPopoverContentSlots>()

const context = useOPopoverContext('OPopoverContent')
const primitive = shallowRef<Element | ComponentPublicInstance | null>(null)
const contentElement = shallowRef<HTMLElement | null>(null)
const mirroredDirection = shallowRef<'ltr' | 'rtl'>()
const delegatedPortalProps = computed(() => ({
  to: props.teleportTo,
  disabled: !props.teleported,
  ...(props.forceMount ? { forceMount: true as const } : {}),
}))
const delegatedContentProps = computed(() => ({
  as: props.as,
  asChild: props.asChild,
  side: props.side,
  align: props.align,
  sideOffset: props.sideOffset,
  alignOffset: props.alignOffset,
  avoidCollisions: props.avoidCollisions,
  collisionPadding: props.collisionPadding,
  sticky: props.sticky,
  hideWhenDetached: props.hideWhenDetached,
  positionStrategy: props.positionStrategy,
  ...(mirroredDirection.value ? { dir: mirroredDirection.value } : {}),
  ...(props.forceMount ? { forceMount: true as const } : {}),
}))
const contentBindings = computed(() => mergeProps(attrs, delegatedContentProps.value))

const resolveContentElement = (): void => {
  contentElement.value = resolvePopoverElement(primitive.value)
}

watchPostEffect(resolveContentElement)
onMounted(() => void nextTick(resolveContentElement))
onUpdated(resolveContentElement)

watch(
  [context.referenceElement, contentElement],
  ([reference, floating], _previous, onCleanup) => {
    if (!reference || !floating) return
    const updateDirection = (): void => {
      const view = reference.ownerDocument.defaultView
      const computedDirection = view?.getComputedStyle(reference).direction
      const ownerDirection = reference.closest<HTMLElement>('[dir]')?.dir
      const direction = computedDirection || ownerDirection
      mirroredDirection.value = direction === 'ltr' || direction === 'rtl' ? direction : undefined
      const surface = floating.matches('[data-slot="popover-content"]')
        ? floating
        : floating.querySelector<HTMLElement>('[data-slot="popover-content"]')
      if (!surface) return
      surface.id = context.contentId
      surface.setAttribute('aria-labelledby', context.triggerId)
      if (mirroredDirection.value) surface.dir = mirroredDirection.value
    }
    const controller = syncFloatingContext(reference, floating, updateDirection)
    updateDirection()
    onCleanup(controller.stop)
  },
  { flush: 'post' },
)
</script>

<template>
  <PopoverPortal v-bind="delegatedPortalProps">
    <PopoverContent
      v-bind="contentBindings"
      ref="primitive"
      class="o-popover__content"
      data-slot="popover-content"
      :id="context.contentId"
      :aria-labelledby="context.triggerId"
      @escape-key-down="emit('escapeKeyDown', $event)"
      @pointer-down-outside="emit('pointerDownOutside', $event)"
      @focus-outside="emit('focusOutside', $event)"
      @interact-outside="emit('interactOutside', $event)"
      @open-auto-focus="emit('openAutoFocus', $event)"
      @close-auto-focus="emit('closeAutoFocus', $event)"
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
