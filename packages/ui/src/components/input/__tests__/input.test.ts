/* eslint-disable vue/one-component-per-file -- Colocated harnesses exercise controlled updates. */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import {
  OInput,
  oInputProps,
  oInputSizes,
  oInputTypes,
  oInputVariants,
  type OInputEmits,
  type OInputProps,
  type OInputSlots,
  type OInputVariant,
} from '../index'

const inputStyles = readFileSync(
  resolve('packages/ui/src/components/input/style/index.less'),
  'utf8',
)

describe('OInput', () => {
  it('keeps public vocabularies and types aligned with runtime validation', () => {
    const props: OInputProps = {
      modelValue: 'hello',
      type: 'password',
      size: 'lg',
      variant: 'outline',
      placeholder: '请输入',
      clearable: true,
      showPassword: true,
      disabled: false,
      readonly: false,
      invalid: false,
      ariaLabel: '密码',
      clearAriaLabel: '清除密码',
      showPasswordAriaLabel: '显示密码',
      hidePasswordAriaLabel: '隐藏密码',
    }
    const slots: OInputSlots = {
      prefix: () => 'prefix',
      suffix: () => 'suffix',
    }
    const focusEvent = new FocusEvent('focus')
    const emits: OInputEmits = {
      'update:modelValue': ['next'],
      focus: [focusEvent],
      blur: [focusEvent],
      clear: [],
    }
    const variant: OInputVariant = 'outline'

    expect(oInputTypes).toEqual(['text', 'password', 'email', 'search', 'tel', 'url'])
    expect(oInputSizes).toEqual(['sm', 'md', 'lg'])
    expect(oInputVariants).toEqual(['soft', 'outline'])
    expect(oInputProps.variant.default).toBe('soft')
    expect(oInputProps.variant.validator(variant)).toBe(true)
    expect(oInputProps.variant.validator('filled')).toBe(false)
    expect(oInputProps.type.validator(props.type)).toBe(true)
    expect(oInputProps.type.validator('number')).toBe(false)
    expect(oInputProps.size.validator(props.size)).toBe(true)
    expect(oInputProps.size.validator('xl')).toBe(false)
    expect(slots.prefix?.()).toBe('prefix')
    expect(emits['update:modelValue']).toEqual(['next'])
  })

  it('renders the soft field variant by default and outline on request', async () => {
    const wrapper = mount(OInput, { props: { modelValue: '' } })

    expect(wrapper.classes()).toContain('o-input--soft')

    await wrapper.setProps({ variant: 'outline' })

    expect(wrapper.classes()).toContain('o-input--outline')
    expect(wrapper.classes()).not.toContain('o-input--soft')
  })

  it('uses border and brand-soft focus feedback with a forced-colors boundary', () => {
    expect(inputStyles).toContain('--omg-field-focus-shadow: 0 0 0 2px var(--omg-color-brand-soft)')
    expect(inputStyles).toContain('@media (forced-colors: active)')
    expect(inputStyles).toContain('.o-input__control:focus-within')
  })

  it('renders native input semantics and forwards attrs and listeners to the field', async () => {
    let changeTarget: EventTarget | null = null
    const onChange = vi.fn((event: Event) => {
      changeTarget = event.currentTarget
    })
    const wrapper = mount(OInput, {
      props: {
        modelValue: 'hello',
        ariaLabel: '账户',
      },
      attrs: {
        id: 'account',
        name: 'account',
        required: true,
        autocomplete: 'username',
        'aria-describedby': 'account-help',
        class: 'consumer-field',
        onChange,
      },
    })
    const input = wrapper.get('input')

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-input', 'o-input--md']))
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(input.attributes()).toEqual(
      expect.objectContaining({
        id: 'account',
        name: 'account',
        required: '',
        autocomplete: 'username',
        'aria-describedby': 'account-help',
        'aria-label': '账户',
        type: 'text',
      }),
    )
    expect(input.classes()).toEqual(expect.arrayContaining(['o-input__field', 'consumer-field']))

    await input.trigger('change')
    expect(onChange).toHaveBeenCalledOnce()
    expect(changeTarget).toBe(input.element)
  })

  it('emits input, focus, and blur while restoring a rejected controlled value', async () => {
    const wrapper = mount(OInput, { props: { modelValue: 'accepted' } })
    const input = wrapper.get('input')

    await input.setValue('rejected')
    await nextTick()
    await input.trigger('focus')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toEqual([['rejected']])
    expect(input.element.value).toBe('accepted')
    expect(wrapper.emitted('focus')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
    expect(wrapper.emitted('blur')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
  })

  it('renders a parent-normalized controlled value after input', async () => {
    const Harness = defineComponent({
      setup() {
        const value = ref('start')
        return () =>
          h(OInput, {
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue: string) => {
              value.value = nextValue.trim().toUpperCase()
            },
          })
      },
    })
    const wrapper = mount(Harness)
    const input = wrapper.get('input')

    await input.setValue(' next ')
    await nextTick()

    expect(input.element.value).toBe('NEXT')
  })

  it('commits an IME value only after composition ends', async () => {
    const onCompositionStart = vi.fn()
    const onCompositionEnd = vi.fn()
    const wrapper = mount(OInput, {
      props: { modelValue: '' },
      attrs: {
        onCompositionstart: onCompositionStart,
        onCompositionend: onCompositionEnd,
      },
    })
    const input = wrapper.get('input')

    await input.trigger('compositionstart')
    input.element.value = 'n'
    input.element.dispatchEvent(new Event('input', { bubbles: true }))
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    input.element.value = '你'
    await input.trigger('compositionend')
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['你']])
    expect(input.element.value).toBe('')
    expect(onCompositionStart).toHaveBeenCalledOnce()
    expect(onCompositionEnd).toHaveBeenCalledOnce()
  })

  it('renders prefix and suffix slots and clears through a named icon button', async () => {
    const value = ref('search term')
    const onClear = vi.fn()
    const Harness = defineComponent({
      setup: () => () =>
        h(
          OInput,
          {
            modelValue: value.value,
            clearable: true,
            clearAriaLabel: '清除搜索',
            'onUpdate:modelValue': (nextValue: string) => {
              value.value = nextValue
            },
            onClear,
          },
          {
            prefix: () => h('span', { 'data-test': 'prefix' }, 'P'),
            suffix: () => h('span', { 'data-test': 'suffix' }, 'S'),
          },
        ),
    })
    const wrapper = mount(Harness, { attachTo: document.body })
    const input = wrapper.get('input')
    const clear = wrapper.get<HTMLButtonElement>('.o-input__clear')

    expect(wrapper.get('[data-test="prefix"]').text()).toBe('P')
    expect(wrapper.get('[data-test="suffix"]').text()).toBe('S')
    expect(clear.attributes('aria-label')).toBe('清除搜索')
    expect(clear.find('svg').exists()).toBe(true)

    await clear.trigger('click')
    await nextTick()

    expect(value.value).toBe('')
    expect(onClear).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(input.element)
    wrapper.unmount()
  })

  it('toggles only the rendered password type with standard icons', async () => {
    const wrapper = mount(OInput, {
      props: {
        modelValue: 'secret',
        type: 'password',
        showPassword: true,
        showPasswordAriaLabel: '显示密码',
        hidePasswordAriaLabel: '隐藏密码',
      },
    })
    const input = wrapper.get('input')
    const toggle = wrapper.get('.o-input__password-toggle')

    expect(input.attributes('type')).toBe('password')
    expect(toggle.attributes('aria-label')).toBe('显示密码')
    expect(toggle.attributes('aria-pressed')).toBe('false')

    await toggle.trigger('click')
    expect(input.attributes('type')).toBe('text')
    expect(toggle.attributes('aria-label')).toBe('隐藏密码')
    expect(toggle.attributes('aria-pressed')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('reflects disabled, readonly, invalid, type, and size states', () => {
    const wrapper = mount(OInput, {
      props: {
        modelValue: 'value',
        type: 'email',
        size: 'lg',
        variant: 'outline',
        disabled: true,
        readonly: true,
        invalid: true,
        clearable: true,
      },
    })
    const input = wrapper.get('input')

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'o-input--lg',
        'o-input--outline',
        'is-disabled',
        'is-readonly',
        'is-invalid',
      ]),
    )
    expect(input.attributes('type')).toBe('email')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('readonly')).toBeDefined()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('.o-input__clear').exists()).toBe(false)
  })

  it('renders on the server without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OInput, {
            modelValue: 'SSR',
            clearable: true,
            ariaLabel: '服务端输入',
          }),
      }),
    )

    expect(html).toContain('class="o-input')
    expect(html).toContain('value="SSR"')
    expect(html).toContain('aria-label="服务端输入"')
    expect(html).toContain('o-input__clear')
  })
})
