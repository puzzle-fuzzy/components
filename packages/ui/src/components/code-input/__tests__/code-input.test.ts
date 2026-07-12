import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { OCodeInput, oCodeInputProps, oCodeInputSizes, sanitizeOCodeInputValue } from '../index'
import type { OCodeInputEmits, OCodeInputExpose, OCodeInputProps, OCodeInputSize } from '../index'

const codeInputStyles = readFileSync(
  resolve('packages/ui/src/components/code-input/style/index.less'),
  'utf8',
)

const mountControlledCodeInput = (modelValue = '', props: Partial<OCodeInputProps> = {}) => {
  const model = ref(modelValue)
  const Host = defineComponent({
    name: 'OCodeInputTestHost',
    setup() {
      return () =>
        h(OCodeInput, {
          ...props,
          modelValue: model.value,
          'onUpdate:modelValue': (value: string) => {
            model.value = value
          },
        })
    },
  })
  const host = mount(Host, { attachTo: document.body })

  return {
    component: host.getComponent(OCodeInput),
    host,
    model,
  }
}

describe('sanitizeOCodeInputValue', () => {
  it('keeps ASCII digits only and respects the normalized length', () => {
    expect(sanitizeOCodeInputValue(' 1a2３-34567 ', 6)).toBe('123456')
    expect(sanitizeOCodeInputValue('123', 2.9)).toBe('12')
    expect(sanitizeOCodeInputValue('123', 0)).toBe('1')
    expect(sanitizeOCodeInputValue('1234567', Number.POSITIVE_INFINITY)).toBe('123456')
  })
})

describe('OCodeInput', () => {
  it('publishes stable O-prefixed contracts', () => {
    expect(oCodeInputSizes).toEqual(['sm', 'md', 'lg'])
    expect(oCodeInputProps.size.validator('sm')).toBe(true)
    expect(oCodeInputProps.size.validator('huge')).toBe(false)
    expectTypeOf<OCodeInputProps['size']>().toEqualTypeOf<OCodeInputSize | undefined>()
    expectTypeOf<OCodeInputEmits['complete']>().toEqualTypeOf<[value: string]>()
    expectTypeOf<OCodeInputExpose['focus']>().toEqualTypeOf<(index?: number) => void>()
  })

  it('defaults to six accessible numeric positions', () => {
    const wrapper = mount(OCodeInput)
    const inputs = wrapper.findAll('input')

    expect(wrapper.attributes()).toMatchObject({
      role: 'group',
      'aria-label': 'Verification code',
    })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-code-input', 'o-code-input--md']))
    expect(inputs).toHaveLength(6)

    inputs.forEach((input, index) => {
      expect(input.attributes()).toMatchObject({
        type: 'text',
        inputmode: 'numeric',
        pattern: '[0-9]*',
        maxlength: '1',
        'aria-label': `Verification code ${index + 1}/6`,
      })
      expect(input.attributes('autocomplete')).toBe(index === 0 ? 'one-time-code' : 'off')
    })
  })

  it('normalizes the field count and filters an externally controlled value', async () => {
    const wrapper = mount(OCodeInput, {
      props: {
        length: 3.9,
        modelValue: '1a2３34',
      },
    })

    expect(wrapper.findAll('input')).toHaveLength(3)
    expect(wrapper.findAll('input').map((input) => input.element.value)).toEqual(['1', '2', '3'])

    await wrapper.setProps({ length: Number.POSITIVE_INFINITY })
    expect(wrapper.findAll('input')).toHaveLength(6)

    await wrapper.setProps({ length: 0 })
    expect(wrapper.findAll('input')).toHaveLength(1)
  })

  it('filters typed input, updates v-model, and advances focus', async () => {
    const { component, model } = mountControlledCodeInput()
    const inputs = component.findAll('input')

    await inputs[0]!.setValue('a1')
    await nextTick()

    expect(model.value).toBe('1')
    expect(component.emitted('update:modelValue')?.at(-1)).toEqual(['1'])
    expect(document.activeElement).toBe(inputs[1]!.element)

    await inputs[1]!.setValue('2')
    await nextTick()

    expect(model.value).toBe('12')
    expect(document.activeElement).toBe(inputs[2]!.element)
  })

  it('replaces and clears the digit at the active position', async () => {
    const { component, model } = mountControlledCodeInput('123')
    const inputs = component.findAll('input')

    await inputs[1]!.setValue('8')
    await nextTick()
    expect(model.value).toBe('183')

    await component.findAll('input')[1]!.setValue('')
    await nextTick()
    expect(model.value).toBe('13')
  })

  it('removes the previous digit when Backspace is pressed in an empty field', async () => {
    const { component, model } = mountControlledCodeInput('12')
    const inputs = component.findAll('input')

    inputs[2]!.element.focus()
    await inputs[2]!.trigger('keydown', { key: 'Backspace' })
    await nextTick()

    expect(model.value).toBe('1')
    expect(component.emitted('update:modelValue')?.at(-1)).toEqual(['1'])
    expect(document.activeElement).toBe(inputs[1]!.element)
  })

  it('removes the current digit and keeps focus there on Backspace', async () => {
    const { component, model } = mountControlledCodeInput('123')
    const inputs = component.findAll('input')

    inputs[1]!.element.focus()
    await inputs[1]!.trigger('keydown', { key: 'Backspace' })
    await nextTick()

    expect(model.value).toBe('13')
    expect(document.activeElement).toBe(inputs[1]!.element)
  })

  it('does nothing when Backspace is pressed with an empty value', async () => {
    const wrapper = mount(OCodeInput)

    await wrapper.get('input').trigger('keydown', { key: 'Backspace' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('complete')).toBeUndefined()
  })

  it('moves with ArrowLeft and ArrowRight while clamping at both ends', async () => {
    const wrapper = mount(OCodeInput, { attachTo: document.body })
    const inputs = wrapper.findAll('input')

    inputs[2]!.element.focus()
    await inputs[2]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(inputs[1]!.element)

    await inputs[1]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(inputs[2]!.element)

    inputs[0]!.element.focus()
    await inputs[0]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(inputs[0]!.element)

    inputs[5]!.element.focus()
    await inputs[5]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(inputs[5]!.element)
  })

  it('fills a complete numeric value from a mixed full paste', async () => {
    const { component, model } = mountControlledCodeInput()

    await component.get('input').trigger('paste', {
      clipboardData: { getData: () => '12a34 56' },
    })
    await nextTick()

    expect(model.value).toBe('123456')
    expect(component.emitted('update:modelValue')?.at(-1)).toEqual(['123456'])
    expect(component.emitted('complete')).toEqual([['123456']])
    expect(document.activeElement).toBe(component.findAll('input')[5]!.element)
  })

  it('pastes from the selected position without disturbing later digits', async () => {
    const { component, model } = mountControlledCodeInput('123456')

    await component.findAll('input')[2]!.trigger('paste', {
      clipboardData: { getData: () => '99' },
    })
    await nextTick()

    expect(model.value).toBe('129956')
    expect(component.emitted('complete')?.at(-1)).toEqual(['129956'])
  })

  it('ignores a paste without digits', async () => {
    const wrapper = mount(OCodeInput, { props: { modelValue: '12' } })

    await wrapper.findAll('input')[2]!.trigger('paste', {
      clipboardData: { getData: () => 'letters only' },
    })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('complete')).toBeUndefined()
  })

  it('handles an unavailable clipboard payload without changing the value', async () => {
    const wrapper = mount(OCodeInput, { props: { modelValue: '12' } })

    await wrapper.findAll('input')[2]!.trigger('paste')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('complete')).toBeUndefined()
  })

  it('emits complete when typing reaches the configured length', async () => {
    const { component, model } = mountControlledCodeInput('12345')

    await component.findAll('input')[5]!.setValue('6')
    await nextTick()

    expect(model.value).toBe('123456')
    expect(component.emitted('complete')).toEqual([['123456']])
  })

  it.each([
    ['disabled', { disabled: true }],
    ['readonly', { readonly: true }],
  ] as const)('does not mutate while %s', async (_, stateProps) => {
    const wrapper = mount(OCodeInput, {
      props: { modelValue: '12', ...stateProps },
    })
    const inputs = wrapper.findAll('input')

    await inputs[0]!.setValue('9')
    await inputs[1]!.trigger('keydown', { key: 'Backspace' })
    await inputs[1]!.trigger('paste', {
      clipboardData: { getData: () => '654321' },
    })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    const stateAttribute = 'disabled' in stateProps ? 'disabled' : 'readonly'
    expect(inputs.every((input) => input.attributes(stateAttribute) !== undefined)).toBe(true)
  })

  it('renders size, invalid semantics, and consumer attributes on the root', () => {
    const wrapper = mount(OCodeInput, {
      attrs: {
        class: 'consumer-code-input',
        id: 'security-code',
        style: '--consumer-order: 1;',
      },
      props: {
        ariaLabel: '六位验证码',
        invalid: true,
        size: 'lg',
      },
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-code-input--lg', 'is-invalid', 'consumer-code-input']),
    )
    expect(wrapper.attributes('id')).toBe('security-code')
    expect(wrapper.attributes('style')).toContain('--consumer-order: 1')
    expect(wrapper.attributes('aria-label')).toBe('六位验证码')
    expect(
      wrapper.findAll('input').every((input) => input.attributes('aria-invalid') === 'true'),
    ).toBe(true)
    expect(wrapper.findAll('input')[0]!.attributes('aria-label')).toBe('六位验证码 1/6')
  })

  it('emits the original focus and blur events', async () => {
    const wrapper = mount(OCodeInput)
    const input = wrapper.get('input')

    await input.trigger('focus')
    await input.trigger('blur')

    expect(wrapper.emitted('focus')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
    expect(wrapper.emitted('blur')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
  })

  it('autofocuses on mount and exposes a safely clamped focus method', async () => {
    const wrapper = mount(OCodeInput, {
      attachTo: document.body,
      props: { autofocus: true },
    })
    const inputs = wrapper.findAll('input')
    const exposed = wrapper.vm as unknown as OCodeInputExpose

    expect(document.activeElement).toBe(inputs[0]!.element)

    exposed.focus(3.9)
    await nextTick()
    expect(document.activeElement).toBe(inputs[3]!.element)

    exposed.focus(99)
    await nextTick()
    expect(document.activeElement).toBe(inputs[5]!.element)

    exposed.focus(-10)
    await nextTick()
    expect(document.activeElement).toBe(inputs[0]!.element)

    exposed.focus(Number.NaN)
    await nextTick()
    expect(document.activeElement).toBe(inputs[0]!.element)
  })

  it('renders safely through the Vue server renderer', async () => {
    const html = await renderToString(
      createSSRApp(OCodeInput, {
        ariaLabel: 'SSR code',
        modelValue: '12a3',
      }),
    )

    expect(html).toContain('class="o-code-input o-code-input--md"')
    expect(html.match(/class="o-code-input__field"/gu)).toHaveLength(6)
    expect(html).toContain('aria-label="SSR code 1/6"')
    expect(html).not.toContain('value="a"')
  })

  it('restores a filtered field when invalid input cannot change the model', async () => {
    const wrapper = mount(OCodeInput)
    const first = wrapper.get('input')

    await first.setValue('letters')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(first.element.value).toBe('')
  })

  it('uses only OMG custom properties and responsive flex sizing', () => {
    expect(codeInputStyles).toContain('flex: 0 1 var(--omg-code-input-size)')
    expect(codeInputStyles).toContain('min-inline-size: 0')
    expect(codeInputStyles).not.toMatch(/--o-(?!mg-)/)
    expect(codeInputStyles).not.toMatch(/--vp-/)
    expect(codeInputStyles).not.toMatch(/#[\da-f]{3,8}\b/iu)
    expect(codeInputStyles).not.toMatch(/@media\s*\([^)]*(?:max|min)-width/)
  })
})
