import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ODialog,
  oDialogProps,
  type ODialogEmits,
  type ODialogProps,
  type ODialogSlots,
} from '../index'

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
  showModal.mockClear()
  closeDialog.mockClear()
})

afterEach(() => {
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
  it('locks document scrolling while any native dialog is open', () => {
    expect(dialogStyles).toContain('html:has(.o-dialog[open])')
    expect(dialogStyles).toMatch(/html:has\(\.o-dialog\[open\]\)\s*\{[^}]*overflow:\s*hidden/su)
  })

  it('keeps the public props, emits, and slots typed', () => {
    const publicProps: ODialogProps = {
      open: true,
      title: '收到文本',
      description: '来自 Yxswy',
      closeOnMask: true,
      closeOnEsc: true,
      ariaLabel: '文本弹窗',
      showClose: true,
      closeAriaLabel: '关闭文本弹窗',
    }
    const publicEmits: ODialogEmits = {
      'update:open': [false],
      close: [],
    }
    const publicSlots: ODialogSlots = {
      default: () => '正文内容',
      header: () => h('h2', '自定义标题'),
      footer: () => h('button', { type: 'button' }, '确认'),
    }

    expect(oDialogProps.open.default).toBe(false)
    expect(oDialogProps.closeOnMask.default).toBe(true)
    expect(oDialogProps.closeOnEsc.default).toBe(true)
    expect(oDialogProps.showClose.default).toBe(true)
    expect(oDialogProps.closeAriaLabel.default).toBe('Close dialog')
    expect(publicProps.open).toBe(true)
    expect(publicEmits.close).toEqual([])
    expect(publicSlots.header).toBeTypeOf('function')
  })

  it('always renders a native dialog and synchronizes the controlled open state', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      attrs: {
        class: 'consumer-dialog',
        'data-preview': 'true',
        style: 'inline-size: 480px',
      },
      props: {
        open: true,
        title: '收到文本',
        description: '来自 Yxswy',
      },
      slots: {
        default: '正文内容',
        footer: '<button type="button">确认</button>',
      },
    })
    await nextTick()

    const dialog = wrapper.get('dialog.o-dialog')
    expect(dialog.element).toBeInstanceOf(HTMLDialogElement)
    expect(dialog.classes()).toContain('consumer-dialog')
    expect(dialog.attributes('data-preview')).toBe('true')
    expect(dialog.attributes('style')).toContain('inline-size: 480px')
    expect((dialog.element as HTMLDialogElement).open).toBe(true)
    expect(showModal).toHaveBeenCalledOnce()
    expect(dialog.attributes('role')).toBeUndefined()
    expect(dialog.attributes('aria-modal')).toBeUndefined()
    expect(dialog.text()).toContain('收到文本')
    expect(dialog.text()).toContain('来自 Yxswy')
    expect(dialog.text()).toContain('正文内容')
    expect(dialog.find('.o-dialog__footer').text()).toContain('确认')

    await wrapper.setProps({ open: false })
    await nextTick()

    expect((dialog.element as HTMLDialogElement).open).toBe(false)
    expect(closeDialog).toHaveBeenCalledOnce()

    wrapper.unmount()
  })

  it('requests close without imperatively closing when the controlled parent rejects it', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: '收到文本', closeAriaLabel: '关闭文本弹窗' },
    })
    await nextTick()

    const dialog = wrapper.get('dialog')
    await wrapper.get('.o-dialog__close').trigger('click')

    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([[]])
    expect((dialog.element as HTMLDialogElement).open).toBe(true)
    expect(closeDialog).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('prevents native cancel and only requests Escape close when enabled', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: '收到文本' },
    })
    await nextTick()

    const dialog = wrapper.get('dialog')
    const cancel = new Event('cancel', { cancelable: true })
    dialog.element.dispatchEvent(cancel)
    await nextTick()

    expect(cancel.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([[]])
    expect((dialog.element as HTMLDialogElement).open).toBe(true)

    await wrapper.setProps({ closeOnEsc: false })
    const lockedCancel = new Event('cancel', { cancelable: true })
    dialog.element.dispatchEvent(lockedCancel)
    await nextTick()

    expect(lockedCancel.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:open')).toEqual([[false]])

    wrapper.unmount()
  })

  it('keeps forward and backward Tab focus inside the modal', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: '收到文本', closeAriaLabel: '关闭文本弹窗' },
      slots: {
        footer:
          '<button type="button" class="cancel-action">取消</button><button type="button" class="confirm-action">确认</button>',
      },
    })
    await nextTick()

    const dialog = wrapper.get('dialog')
    const closeButton = wrapper.get<HTMLButtonElement>('.o-dialog__close')
    const confirmButton = wrapper.get<HTMLButtonElement>('.confirm-action')

    closeButton.element.focus()
    await dialog.trigger('keydown', { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(confirmButton.element)

    await dialog.trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(closeButton.element)

    wrapper.unmount()
  })

  it('only treats coordinates outside the dialog surface as a mask click', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: '收到文本' },
      slots: { default: '<button type="button">正文操作</button>' },
    })
    await nextTick()

    const dialog = wrapper.get('dialog')
    vi.spyOn(dialog.element, 'getBoundingClientRect').mockReturnValue({
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

    dialog.element.dispatchEvent(
      new MouseEvent('click', { bubbles: true, clientX: 200, clientY: 200 }),
    )
    await wrapper.get('.o-dialog__body button').trigger('click')
    expect(wrapper.emitted('update:open')).toBeUndefined()

    dialog.element.dispatchEvent(
      new MouseEvent('click', { bubbles: true, clientX: 40, clientY: 40 }),
    )
    await nextTick()
    expect(wrapper.emitted('update:open')).toEqual([[false]])

    await wrapper.setProps({ closeOnMask: false })
    dialog.element.dispatchEvent(
      new MouseEvent('click', { bubbles: true, clientX: 40, clientY: 40 }),
    )
    await nextTick()
    expect(wrapper.emitted('update:open')).toEqual([[false]])

    wrapper.unmount()
  })

  it('keeps accessible naming references valid for default and custom headers', async () => {
    const defaultWrapper = mount(ODialog, {
      props: { title: '默认标题', description: '默认描述' },
    })
    const defaultDialog = defaultWrapper.get('dialog')
    const titleId = defaultDialog.attributes('aria-labelledby')
    const descriptionId = defaultDialog.attributes('aria-describedby')

    expect(titleId).toBeTruthy()
    expect(descriptionId).toBeTruthy()
    expect(defaultWrapper.get(`#${titleId}`).text()).toBe('默认标题')
    expect(defaultWrapper.get(`#${descriptionId}`).text()).toBe('默认描述')

    const customWrapper = mount(ODialog, {
      props: { ariaLabel: '显式名称', title: '不会作为名称' },
      slots: { header: '<strong>自定义头部</strong>' },
    })
    const customDialog = customWrapper.get('dialog')

    expect(customDialog.attributes('aria-label')).toBe('显式名称')
    expect(customDialog.attributes('aria-labelledby')).toBeUndefined()
    expect(customWrapper.get('.o-dialog__header-content').text()).toBe('自定义头部')

    const labelledCustomWrapper = mount(ODialog, {
      slots: { header: '<strong>作为名称的自定义头部</strong>' },
    })
    const customLabelId = labelledCustomWrapper.get('dialog').attributes('aria-labelledby')
    expect(customLabelId).toBeTruthy()
    expect(labelledCustomWrapper.get(`#${customLabelId}`).text()).toBe('作为名称的自定义头部')

    defaultWrapper.unmount()
    customWrapper.unmount()
    labelledCustomWrapper.unmount()
  })

  it('renders deterministic native dialog markup on the server', async () => {
    const render = () =>
      renderToString(
        createSSRApp({
          render: () => h(ODialog, { open: true, title: '收到文本' }, () => '正文内容'),
        }),
      )
    const first = await render()
    const second = await render()

    expect(first).toContain('<dialog')
    expect(first).toContain('class="o-dialog"')
    expect(first).toContain('正文内容')
    expect(first).not.toContain('open')
    expect(first).not.toContain('teleport')
    expect(first.match(/aria-labelledby="([^"]+)"/u)?.[1]).toBe(
      second.match(/aria-labelledby="([^"]+)"/u)?.[1],
    )
  })
})
