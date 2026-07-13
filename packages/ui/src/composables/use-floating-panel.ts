import {
  autoUpdate,
  computePosition,
  flip,
  offset as floatingOffset,
  shift,
  size,
  type Placement,
} from '@floating-ui/dom'
import {
  computed,
  shallowRef,
  watch,
  type ComponentPublicInstance,
  type ComputedRef,
  type CSSProperties,
} from 'vue'

import { syncFloatingContext } from './use-floating-context'

export type OFloatingPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'

export interface UseFloatingPanelOptions {
  readonly isOpen: ComputedRef<boolean>
  readonly placement: ComputedRef<OFloatingPlacement>
  readonly offset?: ComputedRef<number>
  readonly matchReferenceWidth?: boolean
  readonly onDismiss: () => void
}

export const useFloatingPanel = (options: UseFloatingPanelOptions) => {
  const referenceElement = shallowRef<HTMLElement | null>(null)
  const floatingElement = shallowRef<HTMLElement | null>(null)
  const availableHeight = shallowRef<number>()
  const x = shallowRef(0)
  const y = shallowRef(0)
  const ready = shallowRef(false)
  const resolvedPlacement = shallowRef<Placement>(options.placement.value)
  const resolvedOffset = computed(() => options.offset?.value ?? 6)

  const update = async (): Promise<void> => {
    const reference = referenceElement.value
    const floating = floatingElement.value
    if (!reference || !floating) return

    const result = await computePosition(reference, floating, {
      placement: options.placement.value,
      strategy: 'fixed',
      middleware: [
        floatingOffset(resolvedOffset.value),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        size({
          padding: 8,
          apply({ availableHeight: nextAvailableHeight, elements, rects }) {
            const normalizedAvailableHeight = Math.max(0, nextAvailableHeight)
            availableHeight.value = normalizedAvailableHeight
            elements.floating.style.maxHeight = `${normalizedAvailableHeight}px`
            elements.floating.style.minWidth = options.matchReferenceWidth
              ? `${rects.reference.width}px`
              : ''
          },
        }),
      ],
    })

    if (
      !options.isOpen.value ||
      referenceElement.value !== reference ||
      floatingElement.value !== floating
    ) {
      return
    }

    x.value = result.x
    y.value = result.y
    resolvedPlacement.value = result.placement
    ready.value = true
  }

  watch(
    [options.isOpen, referenceElement, floatingElement, options.placement, resolvedOffset],
    ([open, reference, floating], _previous, onCleanup) => {
      ready.value = false
      availableHeight.value = undefined
      if (!open || !reference || !floating || typeof document === 'undefined') return

      const contextSync = syncFloatingContext(reference, floating, () => void update())
      const stop = autoUpdate(reference, floating, () => {
        contextSync.sync()
        void update()
      })
      const onPointerDown = (event: PointerEvent): void => {
        const target = event.target
        if (!(target instanceof Node)) return
        if (!reference.contains(target) && !floating.contains(target)) options.onDismiss()
      }

      document.addEventListener('pointerdown', onPointerDown, true)
      onCleanup(() => {
        contextSync.stop()
        stop()
        document.removeEventListener('pointerdown', onPointerDown, true)
      })
    },
    { flush: 'post' },
  )

  const floatingStyle = computed<CSSProperties>(() => ({
    position: 'fixed',
    left: `${x.value}px`,
    top: `${y.value}px`,
    visibility: ready.value ? undefined : 'hidden',
  }))

  const resolveElement = (
    element: Element | ComponentPublicInstance | null,
  ): HTMLElement | null => {
    if (typeof HTMLElement === 'undefined') return null
    if (element instanceof HTMLElement) return element

    const rootElement = (element as ComponentPublicInstance | null)?.$el as unknown
    return rootElement instanceof HTMLElement ? rootElement : null
  }
  const setReferenceElement = (element: Element | ComponentPublicInstance | null): void => {
    referenceElement.value = resolveElement(element)
  }
  const setFloatingElement = (element: Element | ComponentPublicInstance | null): void => {
    floatingElement.value = resolveElement(element)
  }

  return {
    availableHeight,
    referenceElement,
    floatingElement,
    floatingStyle,
    ready,
    resolvedPlacement,
    setReferenceElement,
    setFloatingElement,
    update,
  }
}
