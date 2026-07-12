/* eslint-disable vue/one-component-per-file -- Colocated harnesses exercise shared-app IDs and controlled normalization. */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import {
  OTextarea,
  normalizeOTextareaRows,
  oTextareaProps,
  resolveOTextareaAutosize,
  type OTextareaAutosizeOptions,
  type OTextareaEmits,
  type OTextareaProps,
} from '../index'

const textareaStyles = readFileSync(
  resolve('packages/ui/src/components/textarea/style/index.less'),
  'utf8',
)

describe('OTextarea', () => {
  it('keeps the fixed and autosize public contracts stable', () => {
    const autosize: OTextareaAutosizeOptions = { minRows: 2, maxRows: 8 }
    const publicProps: OTextareaProps = {
      modelValue: 'hello',
      placeholder: '输入内容',
      rows: 5,
      maxlength: 100,
      autosize,
      showCount: true,
      disabled: false,
      readonly: false,
      invalid: false,
      ariaLabel: '消息',
    }
    const event = new FocusEvent('focus')
    const publicEmits: OTextareaEmits = {
      'update:modelValue': ['next'],
      focus: [event],
      blur: [event],
    }

    expect(oTextareaProps.rows.default).toBe(4)
    expect(oTextareaProps.autosize.default).toBe(false)
    expect(normalizeOTextareaRows(3.8)).toBe(3)
    expect(normalizeOTextareaRows(0)).toBe(4)
    expect(resolveOTextareaAutosize(false, 5)).toEqual({
      enabled: false,
      minRows: 5,
      maxRows: undefined,
    })
    expect(resolveOTextareaAutosize(autosize, 5)).toEqual({
      enabled: true,
      minRows: 2,
      maxRows: 8,
    })
    expect(resolveOTextareaAutosize({ minRows: -2, maxRows: 1 }, 6)).toEqual({
      enabled: true,
      minRows: 6,
      maxRows: 6,
    })
    expect(publicProps.autosize).toBe(autosize)
    expect(publicEmits['update:modelValue']).toEqual(['next'])
  })

  it('renders textarea semantics and character count', async () => {
    const wrapper = mount(OTextarea, {
      props: {
        modelValue: '你好',
        placeholder: '输入内容',
        maxlength: 10,
        showCount: true,
        ariaLabel: '消息',
      },
    })
    const textarea = wrapper.get('textarea')

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-textarea', 'o-textarea--fixed']))
    expect(textarea.attributes('aria-label')).toBe('消息')
    expect(textarea.attributes('placeholder')).toBe('输入内容')
    expect(textarea.attributes('maxlength')).toBe('10')
    expect(wrapper.get('.o-textarea__count').text()).toBe('2/10')

    await textarea.setValue('新的内容')

    expect(wrapper.emitted('update:modelValue')).toEqual([['新的内容']])
  })

  it('normalizes fixed rows and opts into content sizing with optional bounds', async () => {
    const wrapper = mount(OTextarea, {
      props: { modelValue: 'first\nsecond', rows: 0 },
    })
    const textarea = wrapper.get('textarea')

    expect(textarea.attributes('rows')).toBe('4')
    expect(textarea.attributes('style')).toContain('--omg-textarea-min-rows: 4')
    expect(wrapper.classes()).toContain('o-textarea--fixed')

    await wrapper.setProps({ rows: 3, autosize: true })

    expect(wrapper.classes()).toContain('o-textarea--autosize')
    expect(textarea.attributes('rows')).toBe('3')
    expect(textarea.attributes('style')).toContain('--omg-textarea-min-rows: 3')
    expect(textarea.attributes('style')).not.toContain('--omg-textarea-max-rows')

    await wrapper.setProps({ autosize: { minRows: 2, maxRows: 7 } })

    expect(textarea.attributes('rows')).toBe('2')
    expect(textarea.attributes('style')).toContain('--omg-textarea-min-rows: 2')
    expect(textarea.attributes('style')).toContain('--omg-textarea-max-rows: 7')
    expect(wrapper.classes()).toContain('is-autosize-bounded')
  })

  it('always hides native resize affordances and styles the native scroll surface', () => {
    expect(textareaStyles).toContain("@import '../../../styles/mixins.less'")
    expect(textareaStyles).toContain('field-sizing: content')
    expect(textareaStyles).toContain('resize: none')
    expect(textareaStyles).toContain('.omg-scrollbar()')
    expect(textareaStyles).not.toContain('resize: vertical')
    expect(textareaStyles).not.toContain('resize: horizontal')
    expect(textareaStyles).not.toContain('resize: both')
  })

  it('forwards native textarea attributes and listeners to the field', async () => {
    let changeTarget: EventTarget | null = null
    const onChange = vi.fn((event: Event) => {
      changeTarget = event.currentTarget
    })
    const onInvalid = vi.fn()
    const wrapper = mount(OTextarea, {
      props: { modelValue: '' },
      attrs: {
        id: 'message',
        name: 'message',
        form: 'message-form',
        required: true,
        autocomplete: 'off',
        inputmode: 'text',
        'aria-describedby': 'message-help',
        onChange,
        onInvalid,
      },
    })
    const textarea = wrapper.get('textarea')

    expect(wrapper.attributes('id')).toBeUndefined()
    expect(textarea.attributes()).toEqual(
      expect.objectContaining({
        id: 'message',
        name: 'message',
        form: 'message-form',
        required: '',
        autocomplete: 'off',
        inputmode: 'text',
        'aria-describedby': 'message-help',
      }),
    )

    await textarea.trigger('change')
    textarea.element.dispatchEvent(new Event('invalid', { cancelable: true }))

    expect(onChange).toHaveBeenCalledOnce()
    expect(changeTarget).toBe(textarea.element)
    expect(onInvalid).toHaveBeenCalledOnce()
  })

  it('associates each visible count with its textarea using SSR-safe unique ids', async () => {
    const Harness = defineComponent({
      render: () =>
        h('div', [
          h(OTextarea, {
            modelValue: 'one',
            showCount: true,
            'aria-describedby': 'first-help',
          }),
          h(OTextarea, { modelValue: 'two', showCount: true }),
        ]),
    })
    const wrapper = mount(Harness)
    const textareas = wrapper.findAll('textarea')
    const counts = wrapper.findAll('.o-textarea__count')
    const countIds = counts.map((count) => count.attributes('id'))

    expect(countIds.every(Boolean)).toBe(true)
    expect(new Set(countIds).size).toBe(2)
    expect(textareas[0]?.attributes('aria-describedby')?.split(/\s+/u)).toEqual([
      'first-help',
      countIds[0],
    ])
    expect(textareas[1]?.attributes('aria-describedby')).toBe(countIds[1])

    const render = () => h(OTextarea, { modelValue: 'SSR', showCount: true })
    const html = await renderToString(createSSRApp({ render }))
    const container = document.createElement('div')
    container.innerHTML = html
    const serverCountId = container.querySelector('.o-textarea__count')?.id
    const app = createSSRApp({ render })
    app.mount(container)

    expect(serverCountId).toBeTruthy()
    expect(container.querySelector('.o-textarea__count')?.id).toBe(serverCountId)
    expect(container.querySelector('textarea')?.getAttribute('aria-describedby')).toBe(
      serverCountId,
    )
    app.unmount()
  })

  it('restores the controlled value when an update is rejected', async () => {
    const wrapper = mount(OTextarea, {
      props: { modelValue: 'accepted', showCount: true },
    })
    const textarea = wrapper.get('textarea')

    await textarea.setValue('rejected')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['rejected']])
    expect(textarea.element.value).toBe('accepted')
    expect(wrapper.get('.o-textarea__count').text()).toBe('8')
  })

  it('renders a parent-normalized controlled value after input', async () => {
    const Harness = defineComponent({
      setup() {
        const value = ref('start')
        return () =>
          h(OTextarea, {
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue: string) => {
              value.value = nextValue.trim().toUpperCase()
            },
          })
      },
    })
    const wrapper = mount(Harness)
    const textarea = wrapper.get('textarea')

    await textarea.setValue(' next ')
    await nextTick()

    expect(textarea.element.value).toBe('NEXT')
  })

  it('does not commit intermediate IME composition values', async () => {
    const onCompositionStart = vi.fn()
    const onCompositionEnd = vi.fn()
    const wrapper = mount(OTextarea, {
      props: { modelValue: '' },
      attrs: {
        onCompositionstart: onCompositionStart,
        onCompositionend: onCompositionEnd,
      },
    })
    const textarea = wrapper.get('textarea')

    await textarea.trigger('compositionstart')
    textarea.element.value = 'n'
    textarea.element.dispatchEvent(new Event('input', { bubbles: true }))

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    textarea.element.value = '你'
    await textarea.trigger('compositionend')
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['你']])
    expect(textarea.element.value).toBe('')
    expect(onCompositionStart).toHaveBeenCalledOnce()
    expect(onCompositionEnd).toHaveBeenCalledOnce()
  })

  it('emits focus and blur from the native textarea', async () => {
    const wrapper = mount(OTextarea, { props: { modelValue: '' } })
    const textarea = wrapper.get('textarea')

    await textarea.trigger('focus')
    await textarea.trigger('blur')

    expect(wrapper.emitted('focus')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
    expect(wrapper.emitted('blur')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
  })

  it('reflects disabled, readonly, and invalid states', () => {
    const wrapper = mount(OTextarea, {
      props: {
        modelValue: '',
        disabled: true,
        readonly: true,
        invalid: true,
      },
    })
    const textarea = wrapper.get('textarea')

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['is-disabled', 'is-readonly', 'is-invalid']),
    )
    expect(textarea.attributes('disabled')).toBeDefined()
    expect(textarea.attributes('readonly')).toBeDefined()
    expect(textarea.attributes('aria-invalid')).toBe('true')
  })

  it('renders on the server', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(OTextarea, { modelValue: 'SSR', ariaLabel: '消息' }),
      }),
    )

    expect(html).toContain('class="o-textarea')
    expect(html).toContain('aria-label="消息"')
    expect(html).toContain('SSR')
  })
})
