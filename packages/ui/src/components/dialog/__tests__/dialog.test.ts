import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToString } from '@vue/server-renderer'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ODialog,
  normalizeODialogWidth,
  oDialogCloseReasons,
  oDialogCommonProps,
  oDialogProps,
  type ODialogCloseRequest,
  type ODialogEmits,
  type ODialogProps,
  type ODialogSlotProps,
  type ODialogSlots,
} from '../index'

const dialogSource = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/dialog/src/ODialog.vue'),
  'utf8',
)
const dialogStyles = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/dialog/style/index.less'),
  'utf8',
)

const showModal = vi.fn(function (this: HTMLDialogElement): void {
  this.setAttribute('open', '')
})
const closeDialog = vi.fn(function (this: HTMLDialogElement): void {
  this.removeAttribute('open')
  this.dispatchEvent(new Event('close'))
})

let showModalDescriptor: PropertyDescriptor | undefined
let closeDescriptor: PropertyDescriptor | undefined

const flushDialog = async (): Promise<void> => {
  for (let index = 0; index < 6; index += 1) {
    await nextTick()
    await Promise.resolve()
  }
}

const mockDialogBounds = (wrapper: VueWrapper): void => {
  vi.spyOn(wrapper.get('dialog').element, 'getBoundingClientRect').mockReturnValue({
    bottom: 300,
    height: 200,
    left: 100,
    right: 400,
    top: 100,
    width: 300,
    x: 100,
    y: 100,
    toJSON: () => ({}),
  })
}

beforeEach(() => {
  showModalDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
  closeDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: showModal,
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: closeDialog,
  })
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  showModal.mockClear()
  closeDialog.mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  if (showModalDescriptor) {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', showModalDescriptor)
  } else {
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  }
  if (closeDescriptor) {
    Object.defineProperty(HTMLDialogElement.prototype, 'close', closeDescriptor)
  } else {
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
  }
})

describe('ODialog', () => {
  it('defines explicit width, lifecycle, close-reason, and slot contracts', () => {
    const props: ODialogProps = {
      open: true,
      width: 'min(92vw, 42rem)',
      fullscreen: false,
      destroyOnClose: true,
      initialFocus: '#dialog-primary-field',
    }
    const request: ODialogCloseRequest = {
      reason: 'mask',
      originalEvent: new MouseEvent('click'),
    }
    const emits: ODialogEmits = {
      'update:open': [false],
      'request-close': [request],
      open: [],
      opened: [],
      close: ['mask'],
      closed: ['mask'],
    }
    const slotProps: ODialogSlotProps = {
      close: () => undefined,
      titleId: 'dialog-title',
      descriptionId: 'dialog-description',
    }
    const slots: ODialogSlots = {
      title: () => '标题',
      description: () => '描述',
      default: ({ close }) => h('button', { onClick: close }, '关闭'),
      closeIcon: () => h('span', '×'),
    }

    expect(oDialogCloseReasons).toEqual([
      'close-button',
      'mask',
      'escape',
      'slot',
      'native',
      'programmatic',
    ])
    expect(oDialogCommonProps.open.default).toBe(false)
    expect(oDialogProps.width.default).toBe(520)
    expect(oDialogProps.fullscreen.default).toBe(false)
    expect(oDialogProps.destroyOnClose.default).toBe(false)
    expect(props.destroyOnClose).toBe(true)
    expect(emits.close).toEqual(['mask'])
    expect(slotProps.titleId).toBe('dialog-title')
    expect(slots.title?.(slotProps)).toBe('标题')
  })

  it.each([
    [undefined, '520px'],
    [640, '640px'],
    [640.9, '640px'],
    [0, '520px'],
    [Number.NaN, '520px'],
    [' min(92vw, 42rem) ', 'min(92vw, 42rem)'],
    ['   ', '520px'],
  ] as const)('normalizes Dialog width %s to %s', (value, expected) => {
    expect(normalizeODialogWidth(value)).toBe(expected)
  })

  it('opens an initial controlled Dialog once and emits lifecycle in order', async () => {
    const events: string[] = []
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      attrs: { class: 'consumer-dialog', 'data-preview': 'true' },
      props: {
        open: true,
        title: '工作区设置',
        description: '调整显示偏好',
        width: 'min(92vw, 42rem)',
        onOpen: () => events.push('open'),
        onOpened: () => events.push('opened'),
      },
      slots: { default: '正文内容' },
    })
    await flushDialog()

    const dialog = wrapper.get<HTMLDialogElement>('dialog.o-dialog')
    expect(dialog.element.open).toBe(true)
    expect(showModal).toHaveBeenCalledOnce()
    expect(events).toEqual(['open', 'opened'])
    expect(dialog.classes()).toContain('consumer-dialog')
    expect(dialog.attributes('data-preview')).toBe('true')
    expect(dialog.attributes('style')).toContain('--omg-dialog-inline-size: min(92vw, 42rem)')
    expect(dialog.attributes('role')).toBeUndefined()
    expect(dialog.attributes('aria-modal')).toBeUndefined()
  })

  it('separates a rejected request from a later programmatic close', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: 'Settings' },
    })
    await flushDialog()

    await wrapper.get('.o-dialog__close').trigger('click')
    expect(wrapper.emitted('request-close')?.[0]?.[0]).toMatchObject({
      reason: 'close-button',
    })
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.get<HTMLDialogElement>('dialog').element.open).toBe(true)

    await wrapper.setProps({ open: false })
    await flushDialog()
    expect(wrapper.emitted('close')).toEqual([['programmatic']])
    expect(wrapper.emitted('closed')).toEqual([['programmatic']])
  })

  it('retains the first accepted close reason and ignores duplicate gestures', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: 'Settings',
        'onUpdate:open': (open: boolean) => void wrapper.setProps({ open }),
      },
    })
    await flushDialog()

    const close = wrapper.get<HTMLButtonElement>('.o-dialog__close').element
    close.click()
    close.click()
    await flushDialog()

    expect(wrapper.emitted('request-close')).toHaveLength(1)
    expect(wrapper.emitted('close')).toEqual([['close-button']])
    expect(wrapper.emitted('closed')).toEqual([['close-button']])
    expect(closeDialog).toHaveBeenCalledOnce()
  })

  it('prevents native cancel and controls Escape requests', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: 'Settings' },
    })
    await flushDialog()

    const dialog = wrapper.get('dialog')
    const cancel = new Event('cancel', { cancelable: true })
    dialog.element.dispatchEvent(cancel)
    await nextTick()
    expect(cancel.defaultPrevented).toBe(true)
    expect(wrapper.emitted('request-close')?.[0]?.[0]).toMatchObject({ reason: 'escape' })

    await wrapper.setProps({ closeOnEsc: false })
    const lockedCancel = new Event('cancel', { cancelable: true })
    dialog.element.dispatchEvent(lockedCancel)
    await nextTick()
    expect(lockedCancel.defaultPrevented).toBe(true)
    expect(wrapper.emitted('request-close')).toHaveLength(1)
  })

  it('requires pointer-down and pointer-up outside for a mask request', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: 'Gesture' },
      slots: { default: '<button class="inside" type="button">Inside</button>' },
    })
    await flushDialog()
    mockDialogBounds(wrapper)

    wrapper
      .get('.inside')
      .element.dispatchEvent(
        new MouseEvent('pointerdown', { bubbles: true, clientX: 200, clientY: 200 }),
      )
    wrapper
      .get('dialog')
      .element.dispatchEvent(
        new MouseEvent('pointerup', { bubbles: true, clientX: 20, clientY: 20 }),
      )
    expect(wrapper.emitted('request-close')).toBeUndefined()

    wrapper
      .get('dialog')
      .element.dispatchEvent(
        new MouseEvent('pointerdown', { bubbles: true, clientX: 20, clientY: 20 }),
      )
    wrapper
      .get('dialog')
      .element.dispatchEvent(
        new MouseEvent('pointerup', { bubbles: true, clientX: 20, clientY: 20 }),
      )
    await nextTick()
    expect(wrapper.emitted('request-close')?.[0]?.[0]).toMatchObject({ reason: 'mask' })
  })

  it('focuses initialFocus and falls back safely for invalid selectors', async () => {
    const focused = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: 'Focus', initialFocus: '#primary-field' },
      slots: { default: '<input id="primary-field" /><button type="button">Done</button>' },
    })
    await flushDialog()
    expect(document.activeElement).toBe(focused.get('#primary-field').element)

    const fallback = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: 'Fallback', initialFocus: '[' },
      slots: { default: '<input autofocus id="fallback-field" />' },
    })
    await expect(flushDialog()).resolves.toBeUndefined()
    expect(document.activeElement).toBe(fallback.get('#fallback-field').element)
  })

  it('mounts lazily, preserves by default, and destroys only after closed', async () => {
    const preserved = mount(ODialog, {
      attachTo: document.body,
      props: { title: 'Preserved' },
      slots: { default: '<input aria-label="Preserved field" />' },
    })
    expect(preserved.find('[aria-label="Preserved field"]').exists()).toBe(false)
    await preserved.setProps({ open: true })
    await flushDialog()
    preserved.get<HTMLInputElement>('[aria-label="Preserved field"]').element.value = 'kept'
    await preserved.setProps({ open: false })
    await flushDialog()
    await preserved.setProps({ open: true })
    await flushDialog()
    expect(preserved.get<HTMLInputElement>('[aria-label="Preserved field"]').element.value).toBe(
      'kept',
    )

    const destroyed = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: 'Destroyed', destroyOnClose: true },
      slots: { default: '<input aria-label="Destroyed field" />' },
    })
    await flushDialog()
    await destroyed.setProps({ open: false })
    expect(destroyed.find('[aria-label="Destroyed field"]').exists()).toBe(true)
    await flushDialog()
    expect(destroyed.find('[aria-label="Destroyed field"]').exists()).toBe(false)
  })

  it('reopens a rejected unexpected native close', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: 'Native' },
    })
    await flushDialog()
    const dialog = wrapper.get<HTMLDialogElement>('dialog')
    dialog.element.removeAttribute('open')
    dialog.element.dispatchEvent(new Event('close'))
    await flushDialog()

    expect(wrapper.emitted('request-close')?.[0]?.[0]).toEqual({ reason: 'native' })
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(dialog.element.open).toBe(true)
    expect(showModal).toHaveBeenCalledTimes(2)
  })

  it('finalizes an accepted unexpected native close once', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: 'Native',
        'onUpdate:open': (open: boolean) => void wrapper.setProps({ open }),
      },
    })
    await flushDialog()
    const dialog = wrapper.get<HTMLDialogElement>('dialog')
    dialog.element.removeAttribute('open')
    dialog.element.dispatchEvent(new Event('close'))
    await flushDialog()

    expect(wrapper.emitted('request-close')?.[0]?.[0]).toEqual({ reason: 'native' })
    expect(wrapper.emitted('close')).toEqual([['native']])
    expect(wrapper.emitted('closed')).toEqual([['native']])
  })

  it('keeps accessible IDs valid for default and custom slot structures', async () => {
    const wrapper = mount(ODialog, {
      props: { open: true },
      slots: {
        title: ({ titleId }: ODialogSlotProps) => h('span', { 'data-id': titleId }, '标题'),
        description: () => '描述',
        default: ({ close }: ODialogSlotProps) =>
          h('button', { class: 'slot-close', onClick: close }, '关闭'),
      },
    })
    await flushDialog()
    const dialog = wrapper.get('dialog')
    const titleId = dialog.attributes('aria-labelledby')
    const descriptionId = dialog.attributes('aria-describedby')
    expect(wrapper.get(`#${titleId}`).text()).toBe('标题')
    expect(wrapper.get(`#${descriptionId}`).text()).toBe('描述')
    await wrapper.get('.slot-close').trigger('click')
    expect(wrapper.emitted('request-close')?.[0]?.[0]).toMatchObject({ reason: 'slot' })

    const custom = mount(ODialog, {
      props: { open: true },
      slots: {
        header: ({ titleId: customTitleId }: ODialogSlotProps) =>
          h('h2', { id: customTitleId }, '自定义标题'),
      },
    })
    await flushDialog()
    expect(custom.get(`#${custom.get('dialog').attributes('aria-labelledby')}`).text()).toBe(
      '自定义标题',
    )
  })

  it('warns once for an unnamed Dialog or a custom header missing titleId', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mount(ODialog, { props: { open: true } })
    await flushDialog()
    expect(warn).toHaveBeenCalledWith(
      '[OMG UI][ODialog] Provide ariaLabel, title, a title slot, or titleId in header.',
    )

    warn.mockClear()
    mount(ODialog, { props: { open: true }, slots: { header: '<h2>Missing id</h2>' } })
    await flushDialog()
    expect(warn).toHaveBeenCalledOnce()
  })

  it('uses borderless motion, body scrolling, fullscreen, and reduced-motion rules', () => {
    expect(dialogStyles).toMatch(/\.o-dialog\s*\{[^}]*--omg-dialog-inline-size:\s*520px/su)
    expect(dialogStyles).toMatch(/\.o-dialog\s*\{[^}]*border:\s*0/su)
    expect(dialogStyles).toMatch(/\.o-dialog\s*\{[^}]*box-shadow:\s*var\(--omg-shadow-dialog\)/su)
    expect(dialogStyles).toContain("[data-state='opening']")
    expect(dialogStyles).toContain("[data-state='open']")
    expect(dialogStyles).toContain('@starting-style')
    expect(dialogStyles).toContain('allow-discrete')
    expect(dialogStyles).toContain('env(safe-area-inset-top)')
    expect(dialogStyles).toContain('@media (width <= 480px)')
    expect(dialogStyles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(dialogStyles).toMatch(/\.o-dialog__body\s*\{[^}]*overflow:\s*auto/su)
    expect(dialogSource).not.toContain('focusableSelector')
    expect(dialogSource).not.toContain('@keydown')
  })

  it('renders lazy deterministic native markup on the server', async () => {
    const closed = await renderToString(
      createSSRApp({
        render: () => h(ODialog, { title: 'Closed' }, () => 'Hidden content'),
      }),
    )
    expect(closed).toContain('<dialog')
    expect(closed).not.toContain('Hidden content')

    const renderOpen = () =>
      renderToString(
        createSSRApp({
          render: () =>
            h(ODialog, { open: true, title: 'Open', width: 640 }, () => 'Visible content'),
        }),
      )
    const first = await renderOpen()
    const second = await renderOpen()
    expect(first).toContain('Visible content')
    expect(first).toContain('--omg-dialog-inline-size:640px')
    expect(first).not.toMatch(/<dialog[^>]*\sopen(?:\s|>)/u)
    expect(first.match(/aria-labelledby="([^"]+)"/u)?.[1]).toBe(
      second.match(/aria-labelledby="([^"]+)"/u)?.[1],
    )
  })
})
