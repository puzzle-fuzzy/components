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

const inheritedTypographyProperties = [
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-optical-sizing',
  'font-size',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-variation-settings',
  'font-weight',
  'letter-spacing',
  'line-height',
  'text-align',
  'text-rendering',
  'text-transform',
  'word-spacing',
] as const

const syncFloatingContext = (
  reference: HTMLElement,
  floating: HTMLElement,
  onContextChange: () => void,
): { readonly sync: () => void; readonly stop: () => void } => {
  const documentElement = reference.ownerDocument.documentElement
  let mirroredTokenNames = new Set<string>()

  const sync = (): void => {
    const view = reference.ownerDocument.defaultView
    const referenceStyle = view?.getComputedStyle(reference)
    const rootStyle = view?.getComputedStyle(documentElement)

    if (referenceStyle) {
      const nextTokenNames = new Set<string>()
      for (let index = 0; index < referenceStyle.length; index += 1) {
        const property = referenceStyle.item(index)
        if (!property.startsWith('--omg-')) continue

        const value = referenceStyle.getPropertyValue(property)
        const rootValue = rootStyle?.getPropertyValue(property)
        if (value === rootValue) continue

        nextTokenNames.add(property)
        floating.style.setProperty(property, value)
      }
      for (const property of mirroredTokenNames) {
        if (!nextTokenNames.has(property)) floating.style.removeProperty(property)
      }
      mirroredTokenNames = nextTokenNames

      for (const property of inheritedTypographyProperties) {
        const value = referenceStyle.getPropertyValue(property)
        const rootValue = rootStyle?.getPropertyValue(property)
        if (value && value !== rootValue) {
          floating.style.setProperty(property, value)
        } else {
          floating.style.removeProperty(property)
        }
      }
    }

    const themeOwner = reference.closest<HTMLElement>('[data-omg-theme]')
    const theme = themeOwner && themeOwner !== documentElement ? themeOwner.dataset.omgTheme : ''
    if (theme) {
      floating.dataset.omgTheme = theme
    } else {
      floating.removeAttribute('data-omg-theme')
    }

    const languageOwner = reference.closest<HTMLElement>('[lang]')
    const language = languageOwner && languageOwner !== documentElement ? languageOwner.lang : ''
    if (language) {
      floating.lang = language
    } else {
      floating.removeAttribute('lang')
    }

    const directionOwner = reference.closest<HTMLElement>('[dir]')
    const computedDirection = referenceStyle?.getPropertyValue('direction')
    const direction =
      computedDirection === 'ltr' || computedDirection === 'rtl'
        ? computedDirection
        : directionOwner?.dir

    if (direction === 'ltr' || direction === 'rtl') {
      floating.dir = direction
      floating.style.direction = direction
    } else {
      floating.removeAttribute('dir')
      floating.style.removeProperty('direction')
    }
  }

  sync()
  const stopCallbacks: Array<() => void> = []

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      sync()
      onContextChange()
    })
    for (
      let contextElement: HTMLElement | null = reference;
      contextElement;
      contextElement = contextElement.parentElement
    ) {
      observer.observe(contextElement, {
        attributeFilter: ['class', 'data-omg-theme', 'dir', 'lang', 'style'],
        attributes: true,
      })
    }
    stopCallbacks.push(() => observer.disconnect())
  }

  const colorScheme = reference.ownerDocument.defaultView?.matchMedia?.(
    '(prefers-color-scheme: dark)',
  )
  if (colorScheme) {
    const handleColorSchemeChange = (): void => {
      sync()
      onContextChange()
    }
    colorScheme.addEventListener('change', handleColorSchemeChange)
    stopCallbacks.push(() => colorScheme.removeEventListener('change', handleColorSchemeChange))
  }

  return {
    sync,
    stop: () => {
      for (const stop of stopCallbacks) stop()
    },
  }
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
