import { defineComponent, h, nextTick, ref } from 'vue'
import { mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  OReferenceTextarea,
  defaultOReferenceTextareaLabels,
  oReferenceTextareaProps,
  reindexOReferenceTextareaTokens,
  resolveOReferenceTextareaLabels,
  type OReferenceTextareaEmits,
  type OReferenceTextareaMedia,
  type OReferenceTextareaMediaSlotProps,
  type OReferenceTextareaMentionOptionSlotProps,
  type OReferenceTextareaProps,
  type OReferenceTextareaSlots,
} from '../index'

const media: readonly OReferenceTextareaMedia[] = [
  { id: 'dress', src: '/dress.webp', label: '红色旗袍女性' },
  {
    id: 'vase',
    src: '/vase-thumb.webp',
    previewSrc: '/vase.webp',
    label: '桌边陶瓷花瓶',
    alt: '桌边的白色陶瓷花瓶',
  },
]

interface ControlledHarness {
  readonly wrapper: VueWrapper
  readonly value: ReturnType<typeof ref<string>>
  readonly textarea: () => Omit<DOMWrapper<HTMLTextAreaElement>, 'exists'>
}

const mountControlled = (
  initialValue = '',
  extraProps: Record<string, unknown> = {},
): ControlledHarness => {
  const value = ref(initialValue)
  const Harness = defineComponent({
    setup() {
      return () =>
        h(OReferenceTextarea, {
          media,
          teleported: false,
          ...extraProps,
          modelValue: value.value,
          'onUpdate:modelValue': (nextValue: string) => {
            value.value = nextValue
          },
        })
    },
  })
  const wrapper = mount(Harness, { attachTo: document.body })

  return {
    wrapper,
    value,
    textarea: () => wrapper.get<HTMLTextAreaElement>('textarea'),
  }
}

const enterPrompt = async (
  harness: ControlledHarness,
  value: string,
  selectionStart = value.length,
  selectionEnd = selectionStart,
): Promise<void> => {
  const textarea = harness.textarea().element as HTMLTextAreaElement
  textarea.focus()
  textarea.value = value
  textarea.setSelectionRange(selectionStart, selectionEnd)
  textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }))
  await nextTick()
  await nextTick()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('OReferenceTextarea', () => {
  it('keeps the dedicated image-media public contract typed', () => {
    const publicProps: OReferenceTextareaProps = {
      modelValue: '[Image 1]中身着红色旗袍的女性',
      media,
      variant: 'outline',
      labels: { upload: '上传参考图' },
      accept: 'image/*',
      multiple: true,
      maxCount: 4,
      uploadable: true,
      removable: true,
      teleported: false,
      teleportTo: 'body',
    }
    const event = new FocusEvent('focus')
    const publicEmits: OReferenceTextareaEmits = {
      'update:modelValue': ['next'],
      select: [[]],
      remove: [media[0]!, 0],
      focus: [event],
      blur: [event],
    }
    const mediaSlotProps: OReferenceTextareaMediaSlotProps = {
      media: media[0]!,
      index: 0,
      token: '[Image 1]',
    }
    const mentionSlotProps: OReferenceTextareaMentionOptionSlotProps = {
      ...mediaSlotProps,
      active: true,
    }
    const publicSlots: OReferenceTextareaSlots = {
      media: ({ token }) => token,
      mentionOption: ({ media: item }) => item.label,
      upload: () => 'Upload',
    }

    expect(oReferenceTextareaProps.media.default()).toEqual([])
    expect(oReferenceTextareaProps.accept.default).toBe('image/*')
    expect(oReferenceTextareaProps.multiple.default).toBe(true)
    expect(oReferenceTextareaProps.variant.default).toBe('soft')
    expect(defaultOReferenceTextareaLabels.upload).toBe('Select reference images')
    expect(resolveOReferenceTextareaLabels({ upload: '上传参考图' }).upload).toBe('上传参考图')
    expect(publicProps.media).toBe(media)
    expect(publicEmits.remove).toEqual([media[0], 0])
    expect(publicSlots.media?.(mediaSlotProps)).toBe('[Image 1]')
    expect(publicSlots.mentionOption?.(mentionSlotProps)).toBe('红色旗袍女性')
    expect(reindexOReferenceTextareaTokens('[Image 2]', 0)).toBe('[Image 1]')
  })

  it('renders controlled media before the native textarea', () => {
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', media, teleported: false },
    })
    const root = wrapper.get('.o-reference-textarea').element
    const mediaRegion = wrapper.get('.o-reference-textarea__media').element
    const prompt = wrapper.get('.o-reference-textarea__prompt').element

    expect(root.children[0]).toBe(mediaRegion)
    expect(root.children[1]).toBe(prompt)
    expect(wrapper.findAll('.o-reference-textarea__media-item')).toHaveLength(2)
    expect(wrapper.findAllComponents({ name: 'OImage' })).toHaveLength(2)
  })

  it('maps media order to visible Image tokens', () => {
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', media, teleported: false },
    })

    expect(
      wrapper.findAll('.o-reference-textarea__media-token').map((item) => item.text()),
    ).toEqual(['[Image 1]', '[Image 2]'])
    expect(
      wrapper.findAll('.o-reference-textarea__media-label').map((item) => item.text()),
    ).toEqual(['红色旗袍女性', '桌边陶瓷花瓶'])
  })

  it('uses OImage for independent teleported previews', async () => {
    const wrapper = mount(OReferenceTextarea, {
      attachTo: document.body,
      props: { modelValue: '', media, teleported: false },
    })

    await wrapper.findAll('.o-image__trigger')[1]!.trigger('click')
    await nextTick()

    const preview = document.body.querySelector('.o-image__preview-mask')
    expect(preview).not.toBeNull()
    expect(preview?.querySelector('img')?.getAttribute('src')).toBe('/vase.webp')

    preview?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(document.body.querySelector('.o-image__preview-mask')).toBeNull()
  })

  it('emits selected files and permits the same file again', async () => {
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', media: [], teleported: false },
    })
    const input = wrapper.get('input[type="file"]')
    const file = new File(['image'], 'reference.png', { type: 'image/png' })
    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })

    await input.trigger('change')
    await input.trigger('change')

    expect(wrapper.emitted('select')).toEqual([[[file]], [[file]]])
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('limits picker and drop selection by maxCount and multiple', async () => {
    const files = [
      new File(['one'], 'one.png', { type: 'image/png' }),
      new File(['two'], 'two.png', { type: 'image/png' }),
      new File(['three'], 'three.png', { type: 'image/png' }),
    ]
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', media: media.slice(0, 1), maxCount: 2, teleported: false },
    })
    const drop = new Event('drop', { bubbles: true, cancelable: true })
    Object.defineProperty(drop, 'dataTransfer', { value: { files } })
    wrapper.get('.o-reference-textarea__media').element.dispatchEvent(drop)
    await nextTick()

    expect(wrapper.emitted('select')).toEqual([[[files[0]]]])

    const singleWrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', media: [], multiple: false, teleported: false },
    })
    const input = singleWrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: files })
    await input.trigger('change')
    expect(singleWrapper.emitted('select')).toEqual([[[files[0]]]])
  })

  it('emits remove intent without mutating media or rewriting the prompt', async () => {
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '[Image 2] 保持原样', media, teleported: false },
    })

    await wrapper.get('[aria-label="Remove Image 2"]').trigger('click')

    expect(wrapper.emitted('remove')).toEqual([[media[1], 1]])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.props('media')).toStrictEqual(media)
    expect(media).toHaveLength(2)
  })

  it('keeps preview available while readonly and hides mutation controls', () => {
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', media, readonly: true, teleported: false },
    })

    expect(wrapper.get('textarea').attributes('readonly')).toBeDefined()
    expect(wrapper.find('input[type="file"]').exists()).toBe(false)
    expect(wrapper.find('.o-reference-textarea__remove').exists()).toBe(false)
    expect(wrapper.get('.o-image__trigger').attributes('disabled')).toBeUndefined()
  })

  it('disables editing selection removal and preview while disabled', () => {
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', media, disabled: true, teleported: false },
    })

    expect(wrapper.get('textarea').attributes('disabled')).toBeDefined()
    expect(wrapper.find('input[type="file"]').exists()).toBe(false)
    expect(wrapper.find('.o-reference-textarea__remove').exists()).toBe(false)
    expect(wrapper.get('.o-image__trigger').attributes('disabled')).toBeDefined()
  })

  it('preserves textarea attrs autosize count focus blur and controlled rejection', async () => {
    const onChange = vi.fn()
    const wrapper = mount(OReferenceTextarea, {
      props: {
        modelValue: 'accepted',
        media,
        variant: 'outline',
        autosize: { minRows: 2, maxRows: 5 },
        maxlength: 80,
        showCount: true,
        teleported: false,
      },
      attrs: { id: 'reference-prompt', name: 'prompt', required: true, onChange },
    })
    const textarea = wrapper.get('textarea')

    expect(textarea.attributes()).toEqual(
      expect.objectContaining({ id: 'reference-prompt', name: 'prompt', required: '' }),
    )
    expect(wrapper.get('.o-textarea').classes()).toContain('o-textarea--outline')
    expect(wrapper.get('.o-textarea').classes()).toContain('o-textarea--autosize')
    expect(wrapper.get('.o-textarea__count').text()).toBe('8/80')

    await textarea.trigger('focus')
    await textarea.setValue('rejected')
    await nextTick()
    await textarea.trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toEqual([['rejected']])
    expect((textarea.element as HTMLTextAreaElement).value).toBe('accepted')
    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('uses stable composite keys when consumer media IDs repeat', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const wrapper = mount(OReferenceTextarea, {
      props: {
        modelValue: '',
        media: [
          { ...media[0]!, id: 'duplicate' },
          { ...media[1]!, id: 'duplicate' },
        ],
        teleported: false,
      },
    })

    await wrapper.setProps({ media: media.map((item) => ({ ...item, id: 'duplicate' })) })

    expect(wrapper.findAll('.o-reference-textarea__media-item')).toHaveLength(2)
    expect(warning.mock.calls.flat().join(' ')).not.toContain('Duplicate keys')
    warning.mockRestore()
  })

  it('opens the image listbox from @ while retaining textarea focus', async () => {
    const harness = mountControlled()
    await enterPrompt(harness, '@')

    await vi.waitFor(() => {
      expect(harness.wrapper.get('[role="listbox"]').isVisible()).toBe(true)
    })
    expect(document.activeElement).toBe(harness.textarea().element)
    expect(harness.textarea().attributes('aria-expanded')).toBe('true')
  })

  it('filters options by generated token number and media label', async () => {
    const harness = mountControlled()
    await enterPrompt(harness, '@2')

    expect(harness.wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(harness.wrapper.get('[role="option"]').text()).toContain('[Image 2]')

    await enterPrompt(harness, '@红色')
    expect(harness.wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(harness.wrapper.get('[role="option"]').text()).toContain('红色旗袍女性')
  })

  it('navigates enabled options with Arrow keys and inserts with Enter', async () => {
    const harness = mountControlled()
    await enterPrompt(harness, '@')
    const textarea = harness.textarea().element as HTMLTextAreaElement

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    )
    await nextTick()
    await nextTick()

    expect(harness.value.value).toBe('[Image 2]')
    expect(textarea.selectionStart).toBe('[Image 2]'.length)
  })

  it('inserts with Tab and pointer selection without blurring', async () => {
    const tabHarness = mountControlled()
    await enterPrompt(tabHarness, '@')
    const tabTextarea = tabHarness.textarea().element as HTMLTextAreaElement
    tabTextarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    )
    await nextTick()
    expect(tabHarness.value.value).toBe('[Image 1]')
    tabHarness.wrapper.unmount()

    const pointerHarness = mountControlled()
    await enterPrompt(pointerHarness, '@')
    const option = pointerHarness.wrapper.findAll('[role="option"]')[1]!
    await option.trigger('pointerdown')
    await option.trigger('click')
    await nextTick()

    expect(pointerHarness.value.value).toBe('[Image 2]')
    expect(document.activeElement).toBe(pointerHarness.textarea().element)
  })

  it('replaces only the active @ range and restores the caret', async () => {
    const harness = mountControlled('比较 @红色 与背景')
    const value = '比较 @红色 与背景'
    await enterPrompt(harness, value, 6)
    const textarea = harness.textarea().element as HTMLTextAreaElement

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    )
    await nextTick()
    await nextTick()

    expect(harness.value.value).toBe('比较 [Image 1] 与背景')
    expect(textarea.selectionStart).toBe(3 + '[Image 1]'.length)
  })

  it('closes with Escape and blur outside the compound component', async () => {
    const harness = mountControlled()
    await enterPrompt(harness, '@')
    const textarea = harness.textarea().element as HTMLTextAreaElement

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await nextTick()
    expect(harness.wrapper.find('[role="listbox"]').exists()).toBe(false)

    await enterPrompt(harness, '@')
    const outside = document.createElement('button')
    document.body.append(outside)
    textarea.dispatchEvent(new FocusEvent('blur', { bubbles: true, relatedTarget: outside }))
    await nextTick()
    expect(harness.wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('does not open or commit during IME composition', async () => {
    const harness = mountControlled()
    const textarea = harness.textarea().element as HTMLTextAreaElement
    textarea.focus()
    textarea.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    textarea.value = '@'
    textarea.setSelectionRange(1, 1)
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }))
    await nextTick()

    expect(harness.wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(harness.value.value).toBe('')

    textarea.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '@' }))
    await nextTick()
    await nextTick()
    expect(harness.value.value).toBe('@')
  })

  it('rejects a complete token that would exceed maxlength', async () => {
    const harness = mountControlled('', { maxlength: 8 })
    await enterPrompt(harness, '@')
    const textarea = harness.textarea().element as HTMLTextAreaElement

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    )
    await nextTick()

    expect(harness.value.value).toBe('@')
    expect(harness.wrapper.find('[role="listbox"]').exists()).toBe(true)
  })

  it('does not render an empty listbox without matching media', async () => {
    const harness = mountControlled()
    await enterPrompt(harness, '@不存在')
    expect(harness.wrapper.find('[role="listbox"]').exists()).toBe(false)

    harness.wrapper.unmount()
    const emptyHarness = mountControlled('', { media: [] })
    await enterPrompt(emptyHarness, '@')
    expect(emptyHarness.wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('merges consumer keydown click and input listeners', async () => {
    const onKeydown = vi.fn()
    const onClick = vi.fn()
    const onInput = vi.fn()
    const wrapper = mount(OReferenceTextarea, {
      props: { modelValue: '', media, teleported: false },
      attrs: { onKeydown, onClick, onInput },
    })
    const textarea = wrapper.get('textarea')
    ;(textarea.element as HTMLTextAreaElement).value = '@'
    ;(textarea.element as HTMLTextAreaElement).setSelectionRange(1, 1)

    await textarea.trigger('focus')
    await textarea.trigger('input')
    await textarea.trigger('click')
    await textarea.trigger('select')
    await textarea.trigger('keydown', { key: 'ArrowDown' })

    expect(onKeydown).toHaveBeenCalled()
    expect(onClick).toHaveBeenCalled()
    expect(onInput).toHaveBeenCalled()
  })

  it('exposes the textarea listbox active descendant relationship', async () => {
    const harness = mountControlled()
    await enterPrompt(harness, '@')
    const textarea = harness.textarea()
    const listbox = harness.wrapper.get('[role="listbox"]')
    const activeOption = harness.wrapper.get('[role="option"][aria-selected="true"]')

    expect(textarea.attributes('aria-controls')).toBe(listbox.attributes('id'))
    expect(textarea.attributes('aria-activedescendant')).toBe(activeOption.attributes('id'))
    expect(textarea.attributes('aria-autocomplete')).toBe('list')
  })
})
