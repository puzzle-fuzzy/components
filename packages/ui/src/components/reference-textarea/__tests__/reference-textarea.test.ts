import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
  OReferenceTextarea,
  parseOReferenceTextareaReferences,
  type OReferenceTextareaEmits,
  type OReferenceTextareaProps,
} from '../index'

describe('OReferenceTextarea', () => {
  it('parses member and image reference tokens from textarea text', () => {
    const references = parseOReferenceTextareaReferences(
      '请看 @[Yxswy](member:yxswy) 的图 ![界面截图](image:https://example.com/a.png)',
    )

    expect(references).toEqual([
      {
        id: 'member:yxswy',
        kind: 'member',
        label: 'Yxswy',
        value: 'yxswy',
      },
      {
        id: 'image:https://example.com/a.png',
        kind: 'image',
        label: '界面截图',
        value: 'https://example.com/a.png',
      },
    ])
  })

  it('keeps public props and emits stable', () => {
    const publicProps: OReferenceTextareaProps = {
      modelValue: '@[Yxswy](member:yxswy)',
      placeholder: '输入 @ 或图片引用',
      rows: 4,
      maxlength: 120,
      showCount: true,
      ariaLabel: '带引用的消息',
    }
    const publicEmits: OReferenceTextareaEmits = {
      'update:modelValue': ['next'],
      referencesChange: [[]],
    }

    expect(publicProps.modelValue).toContain('member:yxswy')
    expect(publicEmits.referencesChange).toEqual([[]])
  })

  it('renders parsed references as member chips and image thumbnails', async () => {
    const wrapper = mount(OReferenceTextarea, {
      props: {
        modelValue: 'Hi @[Yxswy](member:yxswy)\n![界面截图](image:https://example.com/a.png)',
        ariaLabel: '带引用的消息',
        showCount: true,
        maxlength: 100,
      },
    })

    expect(wrapper.get('textarea').attributes('aria-label')).toBe('带引用的消息')
    expect(wrapper.get('.o-reference-textarea__member').text()).toContain('Yxswy')
    const image = wrapper.get('.o-reference-textarea__image img')
    expect(image.attributes('src')).toBe('https://example.com/a.png')
    expect(image.attributes('alt')).toBe('界面截图')
    expect(wrapper.get('.o-reference-textarea__count').text()).toContain('/100')

    await wrapper.get('textarea').setValue('只有文本')
    await wrapper.setProps({ modelValue: '只有文本' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['只有文本']])
    expect(wrapper.emitted('referencesChange')?.at(-1)).toEqual([[]])
  })

  it('renders on the server', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OReferenceTextarea, {
            modelValue: '@[Yxswy](member:yxswy)',
            ariaLabel: '带引用的消息',
          }),
      }),
    )

    expect(html).toContain('class="o-reference-textarea')
    expect(html).toContain('Yxswy')
  })
})
