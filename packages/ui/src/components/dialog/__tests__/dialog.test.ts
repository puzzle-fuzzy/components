import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { ODialog, oDialogProps, type ODialogEmits, type ODialogProps } from '../index'

const findDialog = (): HTMLElement | null => document.body.querySelector('.o-dialog')
const findMask = (): HTMLElement | null => document.body.querySelector('.o-dialog__mask')

describe('ODialog', () => {
  it('keeps public props and emits stable', () => {
    const publicProps: ODialogProps = {
      open: true,
      title: '收到文本',
      description: '来自 Yxswy',
      closeOnMask: true,
      closeOnEsc: true,
      ariaLabel: '文本弹窗',
    }
    const publicEmits: ODialogEmits = {
      'update:open': [false],
      close: [],
    }

    expect(oDialogProps.open.default).toBe(false)
    expect(oDialogProps.closeOnMask.default).toBe(true)
    expect(oDialogProps.closeOnEsc.default).toBe(true)
    expect(publicProps.open).toBe(true)
    expect(publicEmits.close).toEqual([])
  })

  it('teleports an accessible dialog when open', () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: '收到文本',
        description: '来自 Yxswy',
      },
      slots: {
        default: '正文内容',
        footer: '<button type="button">关闭</button>',
      },
    })
    const dialog = findDialog()

    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.textContent).toContain('收到文本')
    expect(dialog?.textContent).toContain('来自 Yxswy')
    expect(dialog?.textContent).toContain('正文内容')
    expect(dialog?.querySelector('.o-dialog__footer')?.textContent).toContain('关闭')

    wrapper.unmount()
  })

  it('emits close intents from mask click and Escape', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: { open: true, title: '收到文本' },
    })

    findMask()?.click()
    await nextTick()

    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([[]])

    await wrapper.setProps({ open: true })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('update:open')).toEqual([[false], [false]])
    expect(wrapper.emitted('close')).toEqual([[], []])

    wrapper.unmount()
  })

  it('respects disabled close affordances', async () => {
    const wrapper = mount(ODialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: '锁定弹窗',
        closeOnMask: false,
        closeOnEsc: false,
      },
    })

    findMask()?.click()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('update:open')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()

    wrapper.unmount()
  })

  it('renders closed on the server', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ODialog, { open: false, title: '收到文本' }, () => '正文内容'),
      }),
    )

    expect(html).not.toContain('o-dialog')
  })
})
