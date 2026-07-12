import { renderToString } from '@vue/server-renderer'
import { computed, createSSRApp, defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const stopAutoUpdate = vi.fn()

  return {
    stopAutoUpdate,
    autoUpdate: vi.fn((_reference, _floating, update: () => void) => {
      update()
      return stopAutoUpdate
    }),
    computePosition: vi.fn(async () => ({ x: 12, y: 24, placement: 'bottom-end' })),
    flip: vi.fn((options?: unknown) => ({ name: 'flip', options })),
    offset: vi.fn((options?: unknown) => ({ name: 'offset', options })),
    shift: vi.fn((options?: unknown) => ({ name: 'shift', options })),
    size: vi.fn((options?: unknown) => ({ name: 'size', options })),
  }
})

vi.mock('@floating-ui/dom', () => ({
  autoUpdate: mocks.autoUpdate,
  computePosition: mocks.computePosition,
  flip: mocks.flip,
  offset: mocks.offset,
  shift: mocks.shift,
  size: mocks.size,
}))

import { useFloatingPanel } from '../use-floating-panel'

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
  delete document.documentElement.dataset.omgTheme
  document.documentElement.style.removeProperty('--omg-z-index-dropdown')
})

const Host = defineComponent({
  setup() {
    const open = ref(false)
    const dismissed = ref(0)
    const direction = ref<'ltr' | 'rtl'>()
    const language = ref<string>()
    const theme = ref<string>()
    const floating = useFloatingPanel({
      isOpen: computed(() => open.value),
      placement: computed(() => 'bottom-start' as const),
      matchReferenceWidth: true,
      onDismiss: () => (dismissed.value += 1),
    })

    return {
      dismissed,
      direction,
      floating,
      language,
      open,
      setHostDirection: (value: 'ltr' | 'rtl') => (direction.value = value),
      setHostLanguage: (value: string) => (language.value = value),
      setHostOpen: (value: boolean) => (open.value = value),
      setHostTheme: (value: string) => (theme.value = value),
      theme,
    }
  },
  render() {
    return h('div', { 'data-omg-theme': this.theme, dir: this.direction, lang: this.language }, [
      h('button', { ref: this.floating.setReferenceElement }, 'trigger'),
      this.open
        ? h('div', { ref: this.floating.setFloatingElement, 'data-floating': '' }, 'panel')
        : null,
    ])
  },
})

describe('useFloatingPanel', () => {
  it('starts only while open and cleans up when closed', async () => {
    const wrapper = mount(Host)
    expect(mocks.autoUpdate).not.toHaveBeenCalled()

    wrapper.vm.setHostOpen(true)
    await wrapper.vm.$nextTick()

    expect(mocks.autoUpdate).toHaveBeenCalledTimes(1)
    expect(mocks.computePosition).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.any(HTMLElement),
      expect.objectContaining({ placement: 'bottom-start', strategy: 'fixed' }),
    )
    expect(mocks.offset).toHaveBeenCalledWith(6)
    expect(mocks.flip).toHaveBeenCalledWith({ padding: 8 })
    expect(mocks.shift).toHaveBeenCalledWith({ padding: 8 })
    expect(mocks.size).toHaveBeenCalledWith(expect.objectContaining({ padding: 8 }))
    await vi.waitFor(() => {
      expect(wrapper.vm.floating.resolvedPlacement.value).toBe('bottom-end')
    })
    expect(wrapper.vm.floating.floatingStyle.value).toEqual({
      left: '12px',
      position: 'fixed',
      top: '24px',
      visibility: undefined,
    })

    wrapper.vm.setHostOpen(false)
    await wrapper.vm.$nextTick()
    expect(mocks.stopAutoUpdate).toHaveBeenCalledTimes(1)
  })

  it('dismisses only when pointerdown is outside both elements', async () => {
    const wrapper = mount(Host, { attachTo: document.body })
    wrapper.vm.setHostOpen(true)
    await wrapper.vm.$nextTick()

    wrapper.get('button').element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    expect(wrapper.vm.dismissed).toBe(0)

    wrapper
      .get('[data-floating]')
      .element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    expect(wrapper.vm.dismissed).toBe(0)

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    expect(wrapper.vm.dismissed).toBe(1)

    wrapper.unmount()
  })

  it('does not access browser globals during server setup', async () => {
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)

    await expect(renderToString(createSSRApp(Host))).resolves.toContain('trigger')
    expect(mocks.autoUpdate).not.toHaveBeenCalled()
  })

  it('mirrors the nearest local OMG theme onto the floating surface', async () => {
    const wrapper = mount(Host)
    wrapper.vm.setHostTheme('dark')
    wrapper.vm.setHostOpen(true)
    await wrapper.vm.$nextTick()

    const panel = wrapper.get('[data-floating]')
    expect(panel.attributes('data-omg-theme')).toBe('dark')

    wrapper.vm.setHostTheme('light')
    await vi.waitFor(() => {
      expect(panel.attributes('data-omg-theme')).toBe('light')
    })
  })

  it('mirrors local language and direction and repositions when they change', async () => {
    const wrapper = mount(Host)
    wrapper.vm.setHostDirection('rtl')
    wrapper.vm.setHostLanguage('ar')
    wrapper.vm.setHostOpen(true)
    await wrapper.vm.$nextTick()

    const panel = wrapper.get<HTMLElement>('[data-floating]')
    expect(panel.attributes('dir')).toBe('rtl')
    expect(panel.attributes('lang')).toBe('ar')
    expect(panel.element.style.direction).toBe('rtl')

    const computeCallsBeforeUpdate = mocks.computePosition.mock.calls.length
    wrapper.vm.setHostDirection('ltr')
    wrapper.vm.setHostLanguage('en')
    await vi.waitFor(() => {
      expect(panel.attributes('dir')).toBe('ltr')
      expect(panel.attributes('lang')).toBe('en')
      expect(panel.element.style.direction).toBe('ltr')
      expect(mocks.computePosition.mock.calls.length).toBeGreaterThan(computeCallsBeforeUpdate)
    })
  })

  it('mirrors local typography and OMG token overrides onto the floating surface', async () => {
    const wrapper = mount(Host)
    const reference = wrapper.get<HTMLElement>('button').element
    reference.setAttribute(
      'style',
      'font-family: "Workbench Test"; font-size: 17px; --omg-z-index-dropdown: 3200;',
    )
    wrapper.vm.setHostOpen(true)
    await wrapper.vm.$nextTick()

    const panel = wrapper.get<HTMLElement>('[data-floating]').element
    expect(panel.style.fontFamily).toContain('Workbench Test')
    expect(panel.style.fontSize).toBe('17px')
    expect(panel.style.getPropertyValue('--omg-z-index-dropdown').trim()).toBe('3200')
  })

  it('leaves root-level tokens inherited and refreshes local overrides on color-scheme changes', async () => {
    let colorSchemeListener: EventListener | undefined
    const mediaQuery = {
      addEventListener: vi.fn((_type: string, listener: EventListener) => {
        colorSchemeListener = listener
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mediaQuery),
    )

    document.documentElement.style.setProperty('--omg-z-index-dropdown', '1000')
    const wrapper = mount(Host)
    const reference = wrapper.get<HTMLElement>('button').element
    reference.style.setProperty('--omg-z-index-dropdown', '1000')
    wrapper.vm.setHostOpen(true)
    await wrapper.vm.$nextTick()

    const panel = wrapper.get<HTMLElement>('[data-floating]').element
    expect(panel.style.getPropertyValue('--omg-z-index-dropdown')).toBe('')

    expect(colorSchemeListener).toBeTypeOf('function')
    const computeCallsBeforeChange = mocks.computePosition.mock.calls.length
    colorSchemeListener?.(new Event('change'))
    await vi.waitFor(() => {
      expect(mocks.computePosition.mock.calls.length).toBeGreaterThan(computeCallsBeforeChange)
    })

    wrapper.unmount()
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
