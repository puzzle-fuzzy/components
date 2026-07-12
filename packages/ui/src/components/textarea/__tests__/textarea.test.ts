import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
  OTextarea,
  oTextareaResizeModes,
  oTextareaProps,
  type OTextareaEmits,
  type OTextareaProps,
  type OTextareaResizeMode,
} from '../index'

describe('OTextarea', () => {
  it('keeps public vocabularies and types stable', () => {
    const publicProps: OTextareaProps = {
      modelValue: 'hello',
      placeholder: '输入内容',
      rows: 5,
      maxlength: 100,
      resize: 'vertical',
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

    expect(oTextareaResizeModes).toEqual(['none', 'vertical', 'horizontal', 'both'])
    expect(oTextareaProps.resize.validator(publicProps.resize)).toBe(true)
    expect(oTextareaProps.resize.validator('diagonal')).toBe(false)
    expect(oTextareaProps.rows.default).toBe(4)
    expect(publicEmits['update:modelValue']).toEqual(['next'])
    const resize: OTextareaResizeMode | undefined = publicProps.resize
    expect(resize).toBe('vertical')
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

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-textarea', 'o-textarea--vertical']),
    )
    expect(textarea.attributes('aria-label')).toBe('消息')
    expect(textarea.attributes('placeholder')).toBe('输入内容')
    expect(textarea.attributes('maxlength')).toBe('10')
    expect(wrapper.get('.o-textarea__count').text()).toBe('2/10')

    await textarea.setValue('新的内容')

    expect(wrapper.emitted('update:modelValue')).toEqual([['新的内容']])
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
