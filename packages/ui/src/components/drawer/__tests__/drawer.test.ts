import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  normalizeODrawerSize,
  ODrawer,
  oDrawerPlacements,
  oDrawerProps,
  type ODrawerEmits,
  type ODrawerProps,
  type ODrawerSlots,
} from '../index'

const flushDialog = async (): Promise<void> => {
  for (let index = 0; index < 6; index += 1) {
    await nextTick()
    await Promise.resolve()
  }
}

const drawerSource = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/drawer/src/ODrawer.vue'),
  'utf8',
)
const drawerStyles = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/drawer/style/index.less'),
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
  document.body.replaceChildren()
})

describe('ODrawer', () => {
  it('keeps the public vocabulary, normalizer, props, emits, and slots aligned', () => {
    const publicProps: ODrawerProps = {
      open: true,
      title: '项目设置',
      description: '配置当前项目',
      closeOnMask: true,
      closeOnEsc: true,
      showClose: true,
      closeAriaLabel: '关闭项目设置',
      ariaLabel: '项目设置面板',
      placement: 'start',
      size: '32rem',
    }
    const publicEmits: ODrawerEmits = {
      'update:open': [false],
      'request-close': [{ reason: 'close-button' }],
      close: ['close-button'],
      closed: ['close-button'],
    }
    const publicSlots: ODrawerSlots = {
      title: ({ titleId }) => h('span', { id: titleId }, '标题'),
      description: ({ descriptionId }) => h('span', { id: descriptionId }, '说明'),
      default: ({ close }) => h('button', { onClick: close }, '正文'),
      header: ({ titleId }) => h('h2', { id: titleId }, '自定义标题'),
      footer: ({ close }) => h('button', { type: 'button', onClick: close }, '保存'),
      closeIcon: () => h('span', '×'),
    }

    expect(oDrawerPlacements).toEqual(['start', 'end'])
    expect(oDrawerProps.placement.default).toBe('end')
    expect(oDrawerProps.placement.validator('start')).toBe(true)
    expect(oDrawerProps.placement.validator('left')).toBe(false)
    expect(oDrawerProps.size.default).toBe(400)
    expect(oDrawerProps.closeAriaLabel.default).toBe('Close drawer')
    expect('width' in oDrawerProps).toBe(false)
    expect('fullscreen' in oDrawerProps).toBe(false)
    expect('destroyOnClose' in oDrawerProps).toBe(false)
    expect('initialFocus' in oDrawerProps).toBe(false)
    expect(normalizeODrawerSize(480)).toBe('480px')
    expect(normalizeODrawerSize(480.9)).toBe('480px')
    expect(normalizeODrawerSize(' 32rem ')).toBe('32rem')
    expect(normalizeODrawerSize('min(90vw, 36rem)')).toBe('min(90vw, 36rem)')
    expect(normalizeODrawerSize(0)).toBe('400px')
    expect(normalizeODrawerSize(-12)).toBe('400px')
    expect(normalizeODrawerSize(Number.NaN)).toBe('400px')
    expect(normalizeODrawerSize(Number.POSITIVE_INFINITY)).toBe('400px')
    expect(normalizeODrawerSize('   ')).toBe('400px')
    expect(normalizeODrawerSize(undefined)).toBe('400px')
    expect(publicProps.placement).toBe('start')
    expect(publicEmits.close).toEqual(['close-button'])
    expect(publicSlots.header).toBeTypeOf('function')
  })

  it('composes one native Dialog surface and forwards attrs, content, and size', async () => {
    const wrapper = mount(ODrawer, {
      attachTo: document.body,
      attrs: {
        class: 'consumer-drawer',
        'data-drawer-id': 'settings',
        style: '--consumer-drawer-value: 1',
      },
      props: {
        open: true,
        title: '项目设置',
        description: '配置当前项目',
        size: ' 32rem ',
        closeAriaLabel: '关闭项目设置',
      },
      slots: {
        default: '<p class="drawer-copy">抽屉正文</p>',
        footer: '<button type="button" class="save-action">保存</button>',
      },
    })
    await flushDialog()

    const dialog = wrapper.get<HTMLDialogElement>('dialog.o-dialog.o-drawer')
    const titleId = dialog.attributes('aria-labelledby')
    const descriptionId = dialog.attributes('aria-describedby')

    expect(wrapper.findAll('dialog')).toHaveLength(1)
    expect(dialog.classes()).toEqual(
      expect.arrayContaining(['o-dialog', 'o-drawer', 'o-drawer--end', 'consumer-drawer']),
    )
    expect(dialog.attributes('data-drawer-id')).toBe('settings')
    expect(dialog.attributes('style')).toContain('--consumer-drawer-value: 1')
    expect(dialog.attributes('style')).toContain('--omg-drawer-inline-size: 32rem')
    expect(dialog.element.open).toBe(true)
    expect(showModal).toHaveBeenCalledOnce()
    expect(titleId).toBeTruthy()
    expect(descriptionId).toBeTruthy()
    expect(wrapper.get(`#${titleId}`).text()).toBe('项目设置')
    expect(wrapper.get(`#${descriptionId}`).text()).toBe('配置当前项目')
    expect(wrapper.get('.drawer-copy').text()).toBe('抽屉正文')
    expect(wrapper.get('.o-dialog__footer .save-action').text()).toBe('保存')
    expect(wrapper.get('.o-dialog__close').attributes('aria-label')).toBe('关闭项目设置')

    wrapper.unmount()
  })

  it('forwards a custom header only when the consumer provides it', async () => {
    const defaultWrapper = mount(ODrawer, {
      props: { open: true, title: '默认标题' },
    })
    await flushDialog()
    expect(defaultWrapper.get('.o-dialog__title').text()).toBe('默认标题')

    const customWrapper = mount(ODrawer, {
      props: { open: true },
      slots: {
        header: ({ titleId }) => h('h2', { id: titleId }, '高级设置'),
        default: '自定义正文',
      },
    })
    await flushDialog()
    const dialog = customWrapper.get('dialog')
    const headerId = dialog.attributes('aria-labelledby')

    expect(headerId).toBeTruthy()
    expect(customWrapper.get(`#${headerId}`).text()).toBe('高级设置')
    expect(customWrapper.find('.o-dialog__title').exists()).toBe(false)
    expect(customWrapper.text()).toContain('自定义正文')

    defaultWrapper.unmount()
    customWrapper.unmount()
  })

  it('forwards every Dialog slot and its complete slot props', async () => {
    const received: Record<string, unknown> = {}
    const wrapper = mount(ODrawer, {
      attachTo: document.body,
      props: { open: true },
      slots: {
        title: (slotProps) => {
          received.title = slotProps
          return h('span', { id: slotProps.titleId }, '插槽标题')
        },
        description: (slotProps) => {
          received.description = slotProps
          return h('span', { id: slotProps.descriptionId }, '插槽说明')
        },
        default: (slotProps) => {
          received.default = slotProps
          return h('p', '插槽正文')
        },
        footer: (slotProps) => {
          received.footer = slotProps
          return h('button', { type: 'button' }, '插槽页脚')
        },
        closeIcon: () => h('span', { class: 'custom-close-icon' }, '×'),
      },
    })
    await flushDialog()

    expect(wrapper.get('.o-dialog__title').text()).toBe('插槽标题')
    expect(wrapper.get('.o-dialog__description').text()).toBe('插槽说明')
    expect(wrapper.get('.o-dialog__body').text()).toBe('插槽正文')
    expect(wrapper.get('.o-dialog__footer').text()).toBe('插槽页脚')
    expect(wrapper.get('.custom-close-icon').text()).toBe('×')

    for (const slotName of ['title', 'description', 'default', 'footer']) {
      expect(received[slotName]).toEqual({
        close: expect.any(Function),
        titleId: expect.any(String),
        descriptionId: expect.any(String),
      })
    }

    wrapper.unmount()
  })

  it('mirrors controlled close requests and never closes behind a rejecting parent', async () => {
    const wrapper = mount(ODrawer, {
      attachTo: document.body,
      props: {
        open: true,
        title: '项目设置',
        placement: 'end',
      },
    })
    await flushDialog()

    const dialog = wrapper.get<HTMLDialogElement>('dialog')
    await wrapper.get('.o-dialog__close').trigger('click')

    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('request-close')?.[0]?.[0]).toMatchObject({
      reason: 'close-button',
    })
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(dialog.element.open).toBe(true)
    expect(closeDialog).not.toHaveBeenCalled()

    await wrapper.setProps({ placement: 'start', size: 360 })
    expect(dialog.classes()).toContain('o-drawer--start')
    expect(dialog.classes()).not.toContain('o-drawer--end')
    expect(dialog.attributes('style')).toContain('--omg-drawer-inline-size: 360px')

    await wrapper.setProps({ open: false })
    await flushDialog()
    expect(dialog.element.open).toBe(false)
    expect(closeDialog).toHaveBeenCalledOnce()
    expect(wrapper.emitted('close')).toEqual([['programmatic']])
    expect(wrapper.emitted('closed')).toEqual([['programmatic']])

    wrapper.unmount()
  })

  it('forwards an accepted close lifecycle with the original request reason', async () => {
    const wrapper = mount(ODrawer, {
      attachTo: document.body,
      props: {
        open: true,
        title: '项目设置',
        'onUpdate:open': (open: boolean) => void wrapper.setProps({ open }),
      },
    })
    await flushDialog()

    await wrapper.get('.o-dialog__close').trigger('click')
    await flushDialog()

    expect(wrapper.emitted('request-close')?.[0]?.[0]).toMatchObject({
      reason: 'close-button',
    })
    expect(wrapper.emitted('close')).toEqual([['close-button']])
    expect(wrapper.emitted('closed')).toEqual([['close-button']])
    expect(wrapper.get<HTMLDialogElement>('dialog').element.open).toBe(false)

    wrapper.unmount()
  })

  it('delegates Escape and mask policy to Dialog', async () => {
    const wrapper = mount(ODrawer, {
      attachTo: document.body,
      props: { open: true, title: '项目设置' },
    })
    await flushDialog()

    const dialog = wrapper.get('dialog')
    const cancel = new Event('cancel', { cancelable: true })
    dialog.element.dispatchEvent(cancel)
    await nextTick()

    expect(cancel.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('request-close')?.[0]?.[0]).toMatchObject({ reason: 'escape' })
    expect(wrapper.emitted('close')).toBeUndefined()

    await nextTick()
    vi.spyOn(dialog.element, 'getBoundingClientRect').mockReturnValue({
      bottom: 720,
      height: 720,
      left: 880,
      right: 1280,
      top: 0,
      width: 400,
      x: 880,
      y: 0,
      toJSON: () => ({}),
    })
    dialog.element.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, clientX: 20, clientY: 20 }),
    )
    dialog.element.dispatchEvent(
      new MouseEvent('pointerup', { bubbles: true, clientX: 20, clientY: 20 }),
    )
    await nextTick()

    expect(wrapper.emitted('update:open')).toEqual([[false], [false]])
    expect(wrapper.emitted('request-close')?.[1]?.[0]).toMatchObject({ reason: 'mask' })

    await wrapper.setProps({ closeOnMask: false, closeOnEsc: false })
    const lockedCancel = new Event('cancel', { cancelable: true })
    dialog.element.dispatchEvent(lockedCancel)
    dialog.element.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, clientX: 20, clientY: 20 }),
    )
    dialog.element.dispatchEvent(
      new MouseEvent('pointerup', { bubbles: true, clientX: 20, clientY: 20 }),
    )
    await nextTick()

    expect(lockedCancel.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:open')).toHaveLength(2)
    expect(wrapper.emitted('request-close')).toHaveLength(2)
    expect(wrapper.emitted('close')).toBeUndefined()

    wrapper.unmount()
  })

  it('keeps modal behavior in Dialog while owning only Drawer geometry', () => {
    expect(drawerSource).toContain('<ODialog')
    expect(drawerSource).not.toContain('showModal')
    expect(drawerSource).not.toContain('focusableSelector')
    expect(drawerSource).not.toContain('handleKeydown')
    expect(drawerSource).not.toContain('getBoundingClientRect')

    expect(drawerStyles).toMatch(/\.o-dialog\.o-drawer\s*\{[^}]*border:\s*0;/su)
    expect(drawerStyles).toMatch(/width:\s*min\(100vw,\s*var\(--omg-drawer-inline-size\)\)/u)
    expect(drawerStyles).toMatch(/max-width:\s*100vw/u)
    expect(drawerStyles).toMatch(/height:\s*100dvh/u)
    expect(drawerStyles).toMatch(/max-height:\s*100dvh/u)
    expect(drawerStyles).toMatch(/display\s+180ms\s+allow-discrete/u)
    expect(drawerStyles).toMatch(/overlay\s+180ms\s+allow-discrete/u)
    expect(drawerStyles).toMatch(
      /\.o-dialog\.o-drawer--start\s*\{[^}]*inset-inline:\s*0\s+auto;[^}]*box-shadow:\s*var\(--omg-shadow-drawer-start\)/su,
    )
    expect(drawerStyles).toMatch(
      /\.o-dialog\.o-drawer--end\s*\{[^}]*inset-inline:\s*auto\s+0;[^}]*box-shadow:\s*var\(--omg-shadow-drawer-end\)/su,
    )
    expect(drawerStyles).toMatch(
      /\.o-dialog\.o-drawer--start:dir\(rtl\)\s*\{[^}]*--omg-drawer-closed-translate:\s*100%;[^}]*box-shadow:\s*var\(--omg-shadow-drawer-end\)/su,
    )
    expect(drawerStyles).toMatch(
      /\.o-dialog\.o-drawer--end:dir\(rtl\)\s*\{[^}]*--omg-drawer-closed-translate:\s*-100%;[^}]*box-shadow:\s*var\(--omg-shadow-drawer-start\)/su,
    )
    expect(drawerStyles).toMatch(
      /\.o-dialog\.o-drawer\[open\]\[data-state='opening'\],[\s\S]*\.o-dialog\.o-drawer\[open\]\[data-state='open'\]\s*\{[^}]*transform:\s*none;[^}]*transition-duration:\s*260ms,\s*260ms,\s*260ms,\s*260ms;/u,
    )
    expect(drawerStyles).toMatch(
      /\.o-dialog\.o-drawer\[open\]\[data-state='closing'\]\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translate3d\(var\(--omg-drawer-closed-translate\),\s*0,\s*0\);/su,
    )
    expect(drawerStyles).not.toContain('translate3d(0, 0, 0)')
    expect(drawerStyles).not.toContain('will-change: transform')
    expect(drawerStyles).toMatch(
      /\.o-dialog\.o-drawer\s*>\s*\.o-dialog__body\s*\{[^}]*min-height:\s*0;[^}]*flex:\s*1;/su,
    )
    expect(drawerStyles).toMatch(
      /\.o-dialog\.o-drawer::backdrop\s*\{[^}]*opacity:\s*0;[^}]*display\s+180ms\s+allow-discrete,[^}]*overlay\s+180ms\s+allow-discrete;/su,
    )
    expect(drawerStyles).toMatch(
      /\.o-dialog\.o-drawer\[open\]::backdrop\s*\{[^}]*opacity:\s*1;[^}]*transition-duration:\s*260ms,\s*260ms,\s*260ms;/su,
    )
    expect(drawerStyles).toContain('@starting-style')
    expect(drawerStyles).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*\.o-dialog\.o-drawer,[\s\S]*\.o-dialog\.o-drawer::backdrop\s*\{[^}]*transition:\s*none;/u,
    )
    expect(drawerStyles).not.toMatch(/transition:[^;]*(?:width|height|inset|margin|box-shadow)/u)
  })

  it('renders deterministic native Drawer markup on the server', async () => {
    const render = () =>
      renderToString(
        createSSRApp({
          render: () =>
            h(
              ODrawer,
              { open: true, placement: 'start', size: 360, title: '项目设置' },
              () => '抽屉正文',
            ),
        }),
      )
    const first = await render()
    const second = await render()

    expect(first).toContain('<dialog')
    expect(first).toContain('o-dialog')
    expect(first).toContain('o-drawer')
    expect(first).toContain('o-drawer--start')
    expect(first).toContain('--omg-drawer-inline-size:360px')
    expect(first).toContain('项目设置')
    expect(first).toContain('抽屉正文')
    expect(first).not.toContain(' open')
    expect(first.match(/aria-labelledby="([^"]+)"/u)?.[1]).toBe(
      second.match(/aria-labelledby="([^"]+)"/u)?.[1],
    )
  })
})
