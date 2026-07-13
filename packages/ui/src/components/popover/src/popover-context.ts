import {
  computed,
  inject,
  provide,
  shallowRef,
  type ComponentPublicInstance,
  type ComputedRef,
  type InjectionKey,
  useId,
} from 'vue'

interface OPopoverContext {
  readonly triggerId: string
  readonly contentId: string
  readonly referenceElement: ComputedRef<HTMLElement | null>
  readonly setTriggerElement: (element: HTMLElement | null) => void
  readonly setAnchorElement: (element: HTMLElement | null) => void
}

const oPopoverContextKey: InjectionKey<OPopoverContext> = Symbol('OPopoverContext')

export const resolvePopoverElement = (
  value: Element | ComponentPublicInstance | null,
): HTMLElement | null => {
  if (typeof HTMLElement === 'undefined') return null
  if (value instanceof HTMLElement) return value

  const exposedElement = value && '$el' in value ? (value.$el as unknown) : null
  return exposedElement instanceof HTMLElement ? exposedElement : null
}

export const provideOPopoverContext = (): OPopoverContext => {
  const instanceId = useId()
  const triggerElement = shallowRef<HTMLElement | null>(null)
  const anchorElement = shallowRef<HTMLElement | null>(null)
  const context: OPopoverContext = {
    triggerId: `o-popover-${instanceId}-trigger`,
    contentId: `o-popover-${instanceId}-content`,
    referenceElement: computed(() => anchorElement.value ?? triggerElement.value),
    setTriggerElement: (element) => {
      triggerElement.value = element
    },
    setAnchorElement: (element) => {
      anchorElement.value = element
    },
  }

  provide(oPopoverContextKey, context)
  return context
}

export const useOPopoverContext = (componentName: string): OPopoverContext => {
  const context = inject(oPopoverContextKey)
  if (context) return context

  throw new Error(`[OMG UI][${componentName}] must be used inside OPopover.`)
}
