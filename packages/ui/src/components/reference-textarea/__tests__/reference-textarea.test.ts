import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import {
  OReferenceTextarea,
  oReferenceTextareaProps,
  type OReferenceTextareaEmits,
  type OReferenceTextareaProps,
  type OReferenceTextareaReference,
  type OReferenceTextareaReferenceSlotProps,
  type OReferenceTextareaSlots,
} from '../index'

const referenceTextareaSource = readFileSync(
  resolve('packages/ui/src/components/reference-textarea/src/OReferenceTextarea.vue'),
  'utf8',
)

const references: readonly OReferenceTextareaReference[] = [
  { id: 'brief', label: '需求说明' },
  {
    id: 'preview',
    label: '界面预览',
    kind: 'image',
    thumbnailSrc: 'https://example.com/preview.png',
  },
]

describe('OReferenceTextarea', () => {
  it('keeps the generic public props, emits, and reference slot typed', () => {
    const publicProps: OReferenceTextareaProps = {
      modelValue: '请检查引用内容',
      references,
      placeholder: '输入内容',
      rows: 5,
      maxlength: 120,
      autosize: { minRows: 3, maxRows: 8 },
      showCount: true,
      disabled: false,
      readonly: false,
      invalid: false,
      ariaLabel: '带引用的消息',
    }
    const event = new FocusEvent('focus')
    const publicEmits: OReferenceTextareaEmits = {
      'update:modelValue': ['next'],
      focus: [event],
      blur: [event],
    }
    const slotProps: OReferenceTextareaReferenceSlotProps = {
      reference: references[0]!,
      index: 0,
    }
    const publicSlots: OReferenceTextareaSlots = {
      reference: ({ reference }) => reference.label,
    }

    expect(oReferenceTextareaProps.references.default()).toEqual([])
    expect(publicProps.references).toBe(references)
    expect(publicProps.autosize).toEqual({ minRows: 3, maxRows: 8 })
    expect(publicEmits['update:modelValue']).toEqual(['next'])
    expect(publicSlots.reference?.(slotProps)).toBe('需求说明')
  })

  it('uses standardized fallback icons without replacing image thumbnails', () => {
    const wrapper = mount(OReferenceTextarea, {
      props: {
        modelValue: '',
        references: [
          { id: 'brief', label: '需求说明' },
          { id: 'image', label: '待补充图片', kind: 'image' },
          {
            id: 'preview',
            label: '界面预览',
            kind: 'image',
            thumbnailSrc: 'https://example.com/preview.png',
          },
        ],
      },
    })
    const icons = wrapper.findAll('.o-reference-textarea__reference-icon')

    expect(referenceTextareaSource).toContain(
      "import { LuFileText, LuImage } from 'vue-icons-plus/lu'",
    )
    expect(referenceTextareaSource).not.toContain('<svg')
    expect(icons).toHaveLength(2)
    expect(icons.every((icon) => icon.attributes('aria-hidden') === 'true')).toBe(true)
    expect(wrapper.findAll('.o-reference-textarea__thumbnail')).toHaveLength(1)
  })

  it('renders generic text and image references without parsing modelValue', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    try {
      const wrapper = mount(OReferenceTextarea, {
        props: {
          modelValue: '@[This is plain text](member:not-parsed)',
          references: [
            { id: 'duplicate', label: '需求说明' },
            {
              id: 'duplicate',
              label: '界面预览',
              kind: 'image',
              thumbnailSrc: 'https://example.com/preview.png',
            },
          ],
          ariaLabel: '带引用的消息',
        },
      })

      expect(wrapper.findAll('.o-reference-textarea__reference')).toHaveLength(2)
      expect(wrapper.get('.o-reference-textarea__reference--text').text()).toBe('需求说明')
      const image = wrapper.get('.o-reference-textarea__thumbnail')
      expect(image.attributes('src')).toBe('https://example.com/preview.png')
      expect(image.attributes('alt')).toBe('')
      expect(wrapper.text()).not.toContain('This is plain text')

      await wrapper.setProps({
        references: [
          { id: 'duplicate', label: '更新后的文本' },
          { id: 'duplicate', label: '第二个重复 ID' },
        ],
      })

      expect(wrapper.findAll('.o-reference-textarea__reference')).toHaveLength(2)
      expect(wrapper.text()).toContain('更新后的文本')
      expect(wrapper.text()).toContain('第二个重复 ID')
      expect(warning.mock.calls.flat().join(' ')).not.toContain('Duplicate keys')
      expect(wrapper.emitted('referencesChange')).toBeUndefined()
    } finally {
      warning.mockRestore()
    }
  })

  it('supports a typed reference renderer slot', () => {
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', references },
      slots: {
        reference: ({ reference, index }: OReferenceTextareaReferenceSlotProps) =>
          h('strong', { 'data-reference-index': index }, reference.label),
      },
    })

    const renderedReferences = wrapper.findAll('[data-reference-index]')
    expect(renderedReferences).toHaveLength(2)
    expect(renderedReferences[0]?.text()).toBe('需求说明')
    expect(renderedReferences[1]?.text()).toBe('界面预览')
  })

  it('forwards native attrs and listeners to the composed textarea', async () => {
    let changeTarget: EventTarget | null = null
    const onChange = vi.fn((event: Event) => {
      changeTarget = event.currentTarget
    })
    const onInvalid = vi.fn()
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', references },
      attrs: {
        id: 'reference-message',
        name: 'reference-message',
        required: true,
        'aria-describedby': 'reference-help',
        onChange,
        onInvalid,
      },
    })
    const textarea = wrapper.get('textarea')

    expect(wrapper.attributes('id')).toBeUndefined()
    expect(textarea.attributes()).toEqual(
      expect.objectContaining({
        id: 'reference-message',
        name: 'reference-message',
        required: '',
        'aria-describedby': 'reference-help',
      }),
    )

    await textarea.trigger('change')
    textarea.element.dispatchEvent(new Event('invalid', { cancelable: true }))

    expect(onChange).toHaveBeenCalledOnce()
    expect(changeTarget).toBe(textarea.element)
    expect(onInvalid).toHaveBeenCalledOnce()
  })

  it('forwards fixed and bounded autosize modes to the native textarea', async () => {
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', references, rows: 3 },
    })
    const textarea = wrapper.get('textarea')

    expect(wrapper.get('.o-textarea').classes()).toContain('o-textarea--fixed')
    expect(textarea.attributes('rows')).toBe('3')

    await wrapper.setProps({ autosize: { minRows: 2, maxRows: 6 } })

    expect(wrapper.get('.o-textarea').classes()).toEqual(
      expect.arrayContaining(['o-textarea--autosize', 'is-autosize-bounded']),
    )
    expect(textarea.attributes('rows')).toBe('2')
    expect(textarea.attributes('style')).toContain('--omg-textarea-max-rows: 6')
  })

  it('restores rejected values and renders parent-normalized values', async () => {
    const rejectedWrapper = mount(OReferenceTextarea, {
      props: { modelValue: 'accepted', references },
    })
    const rejectedTextarea = rejectedWrapper.get('textarea')

    await rejectedTextarea.setValue('rejected')
    await nextTick()

    expect(rejectedWrapper.emitted('update:modelValue')).toEqual([['rejected']])
    expect(rejectedTextarea.element.value).toBe('accepted')

    const Harness = defineComponent({
      setup() {
        const value = ref('start')
        return () =>
          h(OReferenceTextarea, {
            modelValue: value.value,
            references,
            'onUpdate:modelValue': (nextValue: string) => {
              value.value = nextValue.trim().toUpperCase()
            },
          })
      },
    })
    const normalizedWrapper = mount(Harness)
    const normalizedTextarea = normalizedWrapper.get('textarea')

    await normalizedTextarea.setValue(' next ')
    await nextTick()

    expect(normalizedTextarea.element.value).toBe('NEXT')
  })

  it('does not emit IME intermediate values and forwards focus and blur', async () => {
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', references },
    })
    const textarea = wrapper.get('textarea')

    await textarea.trigger('focus')
    await textarea.trigger('compositionstart')
    textarea.element.value = 'n'
    textarea.element.dispatchEvent(new Event('input', { bubbles: true }))

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    textarea.element.value = '你'
    await textarea.trigger('compositionend')
    await nextTick()
    await nextTick()
    await textarea.trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toEqual([['你']])
    expect(textarea.element.value).toBe('')
    expect(wrapper.emitted('focus')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
    expect(wrapper.emitted('blur')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
  })

  it('keeps generated count ids stable across server rendering and hydration', async () => {
    const render = () =>
      h(OReferenceTextarea, {
        modelValue: 'SSR',
        references,
        showCount: true,
        'aria-describedby': 'reference-help',
      })
    const html = await renderToString(createSSRApp({ render }))
    const container = document.createElement('div')
    container.innerHTML = html
    const serverCountId = container.querySelector('.o-textarea__count')?.id
    const app = createSSRApp({ render })
    app.mount(container)

    expect(serverCountId).toBeTruthy()
    expect(container.querySelector('.o-textarea__count')?.id).toBe(serverCountId)
    expect(
      container.querySelector('textarea')?.getAttribute('aria-describedby')?.split(/\s+/u),
    ).toEqual(['reference-help', serverCountId])
    expect(container.textContent).toContain('需求说明')
    app.unmount()
  })
})
