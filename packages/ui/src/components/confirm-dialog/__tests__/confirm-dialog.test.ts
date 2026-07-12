import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  OConfirmDialog,
  oConfirmDialogProps,
  oConfirmDialogTones,
  type OConfirmDialogEmits,
  type OConfirmDialogProps,
  type OConfirmDialogSlots,
} from '../index'

const confirmDialogSource = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/confirm-dialog/src/OConfirmDialog.vue'),
  'utf8',
)
const confirmDialogStyles = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/confirm-dialog/style/index.less'),
  'utf8',
)

const showModal = vi.fn(function (this: HTMLDialogElement): void {
  this.setAttribute('open', '')
})
const closeDialog = vi.fn(function (this: HTMLDialogElement): void {
  this.removeAttribute('open')
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

describe('OConfirmDialog', () => {
  it('keeps its public props, emits, slots, and tone vocabulary typed', () => {
    const publicProps: OConfirmDialogProps = {
      open: true,
      title: '删除项目？',
      description: '此操作无法撤销。',
      tone: 'danger',
      confirmLabel: '删除',
      cancelLabel: '取消',
      loading: true,
      disabled: true,
      closeOnMask: false,
      closeOnEsc: false,
      showClose: false,
      closeAriaLabel: '关闭确认弹窗',
      ariaLabel: '删除确认',
    }
    const publicEmits: OConfirmDialogEmits = {
      'update:open': [false],
      confirm: [new MouseEvent('click')],
      cancel: [new MouseEvent('click')],
    }
    const publicSlots: OConfirmDialogSlots = {
      default: () => '确认说明',
      details: () => h('code', 'project-01'),
    }

    expect(oConfirmDialogTones).toEqual(['neutral', 'danger'])
    expect(oConfirmDialogProps.open.default).toBe(false)
    expect(oConfirmDialogProps.tone.default).toBe('neutral')
    expect(oConfirmDialogProps.confirmLabel.default).toBe('Confirm')
    expect(oConfirmDialogProps.cancelLabel.default).toBe('Cancel')
    expect(publicProps.tone).toBe('danger')
    expect(publicEmits.confirm[0]).toBeInstanceOf(MouseEvent)
    expect(publicSlots.details).toBeTypeOf('function')
  })

  it('uses the standard Lucide warning icon without handwritten SVG', () => {
    expect(confirmDialogSource).toContain("import { LuAlertTriangle } from 'vue-icons-plus/lu'")
    expect(confirmDialogSource).not.toMatch(/<svg(?:\s|>)/u)
    expect(confirmDialogStyles).toMatch(
      /\.o-dialog\.o-confirm-dialog\s*\{[^}]*--omg-dialog-max-inline-size:\s*420px/su,
    )
  })

  it('emits confirmation intent without assuming that the dialog should close', async () => {
    const wrapper = mount(OConfirmDialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: '删除项目？',
        confirmLabel: '删除',
        cancelLabel: '取消',
      },
    })
    await nextTick()

    const dialog = wrapper.get<HTMLDialogElement>('dialog')
    await wrapper.get('.o-confirm-dialog__confirm').trigger('click')

    expect(wrapper.emitted('confirm')).toEqual([[expect.any(MouseEvent)]])
    expect(wrapper.emitted('update:open')).toBeUndefined()
    expect(dialog.element.open).toBe(true)

    wrapper.unmount()
  })

  it('requests close and emits cancel while preserving controlled rejection', async () => {
    const wrapper = mount(OConfirmDialog, {
      attachTo: document.body,
      props: { open: true, title: '删除项目？' },
    })
    await nextTick()

    const dialog = wrapper.get<HTMLDialogElement>('dialog')
    const cancelButton = wrapper.get<HTMLButtonElement>('.o-confirm-dialog__cancel')

    expect(cancelButton.attributes()).toHaveProperty('autofocus')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toEqual([[expect.any(MouseEvent)]])
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(dialog.element.open).toBe(true)

    wrapper.unmount()
  })

  it('forwards Escape and mask close requests without inventing cancel events', async () => {
    const wrapper = mount(OConfirmDialog, {
      attachTo: document.body,
      props: { open: true, title: '继续操作？' },
    })
    await nextTick()

    const dialog = wrapper.get<HTMLDialogElement>('dialog')
    dialog.element.dispatchEvent(new Event('cancel', { cancelable: true }))
    await nextTick()

    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('cancel')).toBeUndefined()

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
      new MouseEvent('click', { bubbles: true, clientX: 40, clientY: 40 }),
    )
    await nextTick()

    expect(wrapper.emitted('update:open')).toEqual([[false], [false]])
    expect(wrapper.emitted('cancel')).toBeUndefined()

    wrapper.unmount()
  })

  it('renders danger treatment, content slots, and disabled confirmation states', async () => {
    const wrapper = mount(OConfirmDialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: '删除项目？',
        tone: 'danger',
        loading: true,
        disabled: true,
      },
      slots: {
        default: '删除后不会保留历史版本。',
        details: '<code class="details">project-01</code>',
      },
    })
    await nextTick()

    expect(wrapper.get('dialog').classes()).toContain('o-confirm-dialog--danger')
    expect(wrapper.get('.o-confirm-dialog__signal svg').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.o-confirm-dialog__content').text()).toContain('删除后不会保留历史版本。')
    expect(wrapper.get('.o-confirm-dialog__details .details').text()).toBe('project-01')
    expect(wrapper.get<HTMLButtonElement>('.o-confirm-dialog__confirm').element.disabled).toBe(true)
    expect(wrapper.get('.o-confirm-dialog__confirm').attributes('aria-busy')).toBe('true')

    wrapper.unmount()
  })

  it('renders deterministic accessible markup during SSR', async () => {
    const render = () =>
      renderToString(
        createSSRApp({
          render: () =>
            h(
              OConfirmDialog,
              { open: true, title: '删除项目？', tone: 'danger' },
              { default: () => '此操作无法撤销。' },
            ),
        }),
      )
    const first = await render()
    const second = await render()

    expect(first).toContain('<dialog')
    expect(first).toContain('o-confirm-dialog--danger')
    expect(first).toContain('此操作无法撤销。')
    expect(first).toContain('autofocus')
    expect(first.match(/aria-labelledby="([^"]+)"/u)?.[1]).toBe(
      second.match(/aria-labelledby="([^"]+)"/u)?.[1],
    )
  })
})
