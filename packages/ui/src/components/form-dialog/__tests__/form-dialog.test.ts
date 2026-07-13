import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ODialogCloseRequest } from '../../dialog'
import {
  OFormDialog,
  oFormDialogProps,
  type OFormDialogEmits,
  type OFormDialogProps,
  type OFormDialogSlots,
} from '../index'

const flushDialog = async (): Promise<void> => {
  for (let index = 0; index < 6; index += 1) {
    await nextTick()
    await Promise.resolve()
  }
}

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
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
})

afterEach(() => {
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

describe('OFormDialog', () => {
  it('keeps its public props, emits, and default slot typed', () => {
    const publicProps: OFormDialogProps = {
      open: true,
      title: '编辑资料',
      description: '更新公开信息。',
      submitLabel: '保存',
      cancelLabel: '取消',
      loading: true,
      submitDisabled: true,
      closeOnMask: false,
      closeOnEsc: false,
      showClose: false,
      closeAriaLabel: '关闭表单弹窗',
      ariaLabel: '编辑资料表单',
    }
    const publicEmits: OFormDialogEmits = {
      'update:open': [false],
      'request-close': [{ reason: 'slot' }],
      close: ['slot'],
      closed: ['slot'],
      submit: [new SubmitEvent('submit')],
      cancel: [new MouseEvent('click')],
    }
    const publicSlots: OFormDialogSlots = {
      default: () => h('input', { name: 'name' }),
    }

    expect(oFormDialogProps.open.default).toBe(false)
    expect(oFormDialogProps.submitLabel.default).toBe('Submit')
    expect(oFormDialogProps.cancelLabel.default).toBe('Cancel')
    expect('width' in oFormDialogProps).toBe(false)
    expect('fullscreen' in oFormDialogProps).toBe(false)
    expect('destroyOnClose' in oFormDialogProps).toBe(false)
    expect('initialFocus' in oFormDialogProps).toBe(false)
    expect(publicProps.submitDisabled).toBe(true)
    expect(publicEmits.submit[0]).toBeInstanceOf(SubmitEvent)
    expect(publicSlots.default).toBeTypeOf('function')
  })

  it('associates the footer submit control with an SSR-safe native form', async () => {
    const wrapper = mount(OFormDialog, {
      attachTo: document.body,
      props: { open: true, title: '编辑资料', submitLabel: '保存' },
      slots: { default: '<input name="displayName" />' },
    })
    await flushDialog()

    const form = wrapper.get<HTMLFormElement>('form.o-form-dialog__form')
    const submit = wrapper.get<HTMLButtonElement>('.o-form-dialog__submit')

    expect(form.attributes('id')).toBeTruthy()
    expect(form.attributes('novalidate')).toBeUndefined()
    expect(submit.attributes('type')).toBe('submit')
    expect(submit.attributes('form')).toBe(form.attributes('id'))

    wrapper.unmount()
  })

  it('prevents navigation and emits the untouched native submit event', async () => {
    const wrapper = mount(OFormDialog, {
      attachTo: document.body,
      props: { open: true, title: '编辑资料' },
      slots: { default: '<input name="displayName" value="Yxswy" />' },
    })
    await nextTick()

    const form = wrapper.get<HTMLFormElement>('form')
    const event = new SubmitEvent('submit', { bubbles: true, cancelable: true })
    form.element.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('submit')).toEqual([[event]])
    expect(wrapper.emitted('update:open')).toBeUndefined()

    wrapper.unmount()
  })

  it('preserves native required validation before emitting submit', async () => {
    const wrapper = mount(OFormDialog, {
      attachTo: document.body,
      props: { open: true, title: '编辑资料' },
      slots: { default: '<input class="required-field" name="displayName" required />' },
    })
    await nextTick()

    const form = wrapper.get<HTMLFormElement>('form')
    const input = wrapper.get<HTMLInputElement>('.required-field')
    const submit = wrapper.get<HTMLButtonElement>('.o-form-dialog__submit')

    expect(form.element.checkValidity()).toBe(false)
    submit.element.click()
    await nextTick()
    expect(wrapper.emitted('submit')).toBeUndefined()

    input.element.value = 'Yxswy'
    input.element.dispatchEvent(new Event('input', { bubbles: true }))
    expect(form.element.checkValidity()).toBe(true)
    submit.element.click()
    await nextTick()
    expect(wrapper.emitted('submit')).toHaveLength(1)

    wrapper.unmount()
  })

  it('emits cancellation before requesting a slot close and preserves rejection', async () => {
    const events: string[] = []
    const wrapper = mount(OFormDialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: '编辑资料',
        onCancel: () => events.push('cancel'),
        onRequestClose: ({ reason }: ODialogCloseRequest) => events.push(`request:${reason}`),
      },
    })
    await flushDialog()

    const dialog = wrapper.get<HTMLDialogElement>('dialog')
    const cancel = wrapper.get<HTMLButtonElement>('.o-form-dialog__cancel')
    expect(cancel.attributes()).toHaveProperty('autofocus')

    await cancel.trigger('click')

    expect(events).toEqual(['cancel', 'request:slot'])
    expect(wrapper.emitted('cancel')).toEqual([[expect.any(MouseEvent)]])
    expect(wrapper.emitted('request-close')?.[0]?.[0]).toMatchObject({ reason: 'slot' })
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(dialog.element.open).toBe(true)

    wrapper.unmount()
  })

  it('disables only submission while loading or explicitly disabled', async () => {
    const wrapper = mount(OFormDialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: '编辑资料',
        loading: true,
        submitDisabled: true,
      },
    })
    await nextTick()

    expect(wrapper.get<HTMLButtonElement>('.o-form-dialog__submit').element.disabled).toBe(true)
    expect(wrapper.get('.o-form-dialog__submit').attributes('aria-busy')).toBe('true')
    expect(wrapper.get<HTMLButtonElement>('.o-form-dialog__cancel').element.disabled).toBe(false)

    wrapper.unmount()
  })

  it('renders deterministic form association and accessible dialog markup during SSR', async () => {
    const render = () =>
      renderToString(
        createSSRApp({
          render: () =>
            h(
              OFormDialog,
              { open: true, title: '编辑资料', submitLabel: '保存' },
              { default: () => h('input', { name: 'displayName', required: true }) },
            ),
        }),
      )
    const first = await render()
    const second = await render()

    const firstFormId = first.match(/<form[^>]*id="([^"]+)"/u)?.[1]
    const secondFormId = second.match(/<form[^>]*id="([^"]+)"/u)?.[1]
    expect(firstFormId).toBeTruthy()
    expect(firstFormId).toBe(secondFormId)
    expect(first).toContain(`form="${firstFormId}"`)
    expect(first).toContain('type="submit"')
    expect(first).toContain('required')
    expect(first).toContain('autofocus')
  })
})
