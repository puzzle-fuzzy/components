import { afterEach, describe, expect, it, vi } from 'vitest'

import { syncFloatingContext } from '../use-floating-context'

const flushMutationObserver = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('data-omg-theme')
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
  document.documentElement.removeAttribute('style')
  document.body.replaceChildren()
})

describe('syncFloatingContext', () => {
  it('mirrors only divergent OMG tokens, typography and local document context', () => {
    document.documentElement.style.setProperty('--omg-color-surface', 'white')
    document.documentElement.style.fontSize = '16px'

    const context = document.createElement('section')
    context.dataset.omgTheme = 'dark'
    context.lang = 'zh-CN'
    context.dir = 'rtl'
    const reference = document.createElement('button')
    // JSDOM does not enumerate inherited custom properties from getComputedStyle.
    // Setting them on the reference still exercises the browser-facing diff logic.
    reference.style.setProperty('--omg-color-surface', '#2d2d2d')
    reference.style.setProperty('--omg-space-2', '8px')
    reference.style.fontSize = '18px'
    const floating = document.createElement('div')
    context.append(reference)
    document.body.append(context, floating)

    const controller = syncFloatingContext(reference, floating)

    expect(floating.style.getPropertyValue('--omg-color-surface')).toBe('#2d2d2d')
    expect(floating.style.getPropertyValue('--omg-space-2')).toBe('8px')
    expect(floating.style.fontSize).toBe('18px')
    expect(floating.dataset.omgTheme).toBe('dark')
    expect(floating.lang).toBe('zh-CN')
    expect(floating.dir).toBe('rtl')
    expect(floating.style.direction).toBe('rtl')

    controller.stop()
  })

  it('omits root-equivalent values and removes stale mirrored values', () => {
    document.documentElement.style.setProperty('--omg-color-text', 'black')
    const context = document.createElement('div')
    const reference = document.createElement('button')
    reference.style.setProperty('--omg-color-text', 'black')
    reference.style.setProperty('--omg-color-surface', 'linen')
    const floating = document.createElement('div')
    context.append(reference)
    document.body.append(context, floating)

    const controller = syncFloatingContext(reference, floating)
    expect(floating.style.getPropertyValue('--omg-color-text')).toBe('')
    expect(floating.style.getPropertyValue('--omg-color-surface')).toBe('linen')

    reference.style.removeProperty('--omg-color-surface')
    controller.sync()
    expect(floating.style.getPropertyValue('--omg-color-surface')).toBe('')

    controller.stop()
  })

  it('resynchronizes after context mutations and stops observing on cleanup', async () => {
    const onContextChange = vi.fn()
    const context = document.createElement('div')
    context.dataset.omgTheme = 'light'
    const reference = document.createElement('button')
    const floating = document.createElement('div')
    context.append(reference)
    document.body.append(context, floating)

    const controller = syncFloatingContext(reference, floating, onContextChange)
    context.dataset.omgTheme = 'dark'
    context.lang = 'en'
    await flushMutationObserver()

    expect(floating.dataset.omgTheme).toBe('dark')
    expect(floating.lang).toBe('en')
    expect(onContextChange).toHaveBeenCalled()

    controller.stop()
    onContextChange.mockClear()
    context.dataset.omgTheme = 'light'
    await flushMutationObserver()
    expect(floating.dataset.omgTheme).toBe('dark')
    expect(onContextChange).not.toHaveBeenCalled()
  })
})
