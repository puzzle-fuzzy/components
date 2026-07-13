<script setup lang="ts">
import {
  cloneVNode,
  Comment,
  computed,
  defineComponent,
  Fragment,
  isVNode,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  Text,
  useAttrs,
  useId,
  useSlots,
  watch,
  type VNode,
} from 'vue'

import { useControllableOpen } from '../../../composables/use-controllable-open'
import { useFloatingPanel } from '../../../composables/use-floating-panel'
import {
  normalizeOTooltipDelay,
  normalizeOTooltipOffset,
  oTooltipProps,
  type OTooltipEmits,
  type OTooltipSlots,
} from './tooltip'

defineOptions({
  name: 'OTooltip',
  inheritAttrs: false,
})

const props = defineProps(oTooltipProps)
const emit = defineEmits<OTooltipEmits>()
const attrs = useAttrs()
const slots = useSlots()

defineSlots<OTooltipSlots>()

const tooltipId = `o-tooltip-${useId()}`
const isMounted = ref(false)
const hovered = ref(false)
const focused = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let timerGeneration = 0
let warnedAboutTrigger = false

const { isOpen, setOpen } = useControllableOpen({
  open: computed(() => props.open),
  emit: (event, value) => emit(event, value),
})
const hasContent = computed(() => Boolean(props.content?.trim()) || Boolean(slots.content))
const isTooltipOpen = computed(() => isOpen.value && !props.disabled && hasContent.value)
const floatingOffset = computed(() => normalizeOTooltipOffset(props.offset))

const clearTimer = (): void => {
  timerGeneration += 1
  if (timer !== undefined) clearTimeout(timer)
  timer = undefined
}

const requestState = (open: boolean, delay = 0): void => {
  clearTimer()
  if (open && (props.disabled || !hasContent.value)) return
  if (isOpen.value === open) return

  if (delay <= 0) {
    setOpen(open)
    return
  }

  const generation = timerGeneration
  timer = setTimeout(() => {
    if (generation !== timerGeneration || (open && props.disabled)) return
    timer = undefined
    setOpen(open)
  }, delay)
}

const requestCloseIfInactive = (): void => {
  if (hovered.value || focused.value) return
  requestState(false, normalizeOTooltipDelay(props.hideDelay, 100))
}

const handlePointerEnter = (): void => {
  hovered.value = true
  requestState(true, normalizeOTooltipDelay(props.showDelay))
}

const handlePointerLeave = (): void => {
  hovered.value = false
  requestCloseIfInactive()
}

const handleFocusIn = (): void => {
  focused.value = true
  requestState(true)
}

const handleFocusOut = (): void => {
  focused.value = false
  requestCloseIfInactive()
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'Escape' || !isTooltipOpen.value) return
  event.preventDefault()
  requestState(false)
}

const floating = useFloatingPanel({
  isOpen: isTooltipOpen,
  placement: computed(() => props.placement),
  offset: floatingOffset,
  onDismiss: () => requestState(false),
})

const collectMeaningfulRoots = (nodes: readonly unknown[]): VNode[] => {
  const roots: VNode[] = []

  for (const node of nodes) {
    if (!isVNode(node) || node.type === Comment) continue
    if (node.type === Text && String(node.children ?? '').trim().length === 0) continue
    if (node.type === Fragment && Array.isArray(node.children)) {
      roots.push(...collectMeaningfulRoots(node.children))
      continue
    }
    roots.push(node)
  }

  return roots
}

const warnAboutTrigger = (): void => {
  if (warnedAboutTrigger || !import.meta.env.DEV) return
  warnedAboutTrigger = true
  console.warn('[OMG UI][OTooltip] The default slot must contain exactly one meaningful root.')
}

const TooltipTrigger = defineComponent({
  name: 'OTooltipTrigger',
  setup() {
    return () => {
      const roots = collectMeaningfulRoots(slots.default?.() ?? [])
      if (roots.length !== 1 || roots[0]?.type === Text) warnAboutTrigger()

      const trigger = roots.find((node) => node.type !== Text)
      if (!trigger) return null

      return cloneVNode(
        trigger,
        mergeProps(attrs, {
          ref: floating.setReferenceElement,
          'aria-describedby': isTooltipOpen.value ? tooltipId : undefined,
          onPointerenter: handlePointerEnter,
          onPointerleave: handlePointerLeave,
          onFocusin: handleFocusIn,
          onFocusout: handleFocusOut,
          onKeydown: handleKeydown,
        }),
        true,
      )
    }
  },
})

onMounted(() => {
  isMounted.value = true
})

watch(
  () => props.disabled,
  (disabled) => {
    if (!disabled) return
    hovered.value = false
    focused.value = false
    clearTimer()
    if (isOpen.value) setOpen(false)
  },
)

watch(hasContent, (available) => {
  if (available) return
  clearTimer()
  if (isOpen.value) setOpen(false)
})

onBeforeUnmount(clearTimer)
</script>

<template>
  <TooltipTrigger />
  <Teleport :to="props.teleportTo" :disabled="!isMounted || !props.teleported">
    <Transition name="o-tooltip">
      <div
        v-if="isTooltipOpen"
        :id="tooltipId"
        :ref="floating.setFloatingElement"
        class="o-tooltip"
        role="tooltip"
        :data-placement="floating.resolvedPlacement.value"
        :style="floating.floatingStyle.value"
      >
        <slot name="content">{{ props.content }}</slot>
      </div>
    </Transition>
  </Teleport>
</template>
