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

export interface OFloatingContextSync {
  readonly sync: () => void
  readonly stop: () => void
}

/**
 * Mirrors the local visual and document context that Teleport would otherwise
 * detach from. The utility is intentionally internal to OMG UI's source and
 * does not form part of the package root API.
 */
export const syncFloatingContext = (
  reference: HTMLElement,
  floating: HTMLElement,
  onContextChange: () => void = () => undefined,
): OFloatingContextSync => {
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
